import configparser
import datetime
import os
import time
import boto3
import json
import urllib.parse  # Add this import
import uuid


from django.shortcuts import render
from django.contrib.auth.models import Group, User
from django.contrib.auth import login, authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view  

from rest_framework import permissions, viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response

from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError

from .models import LoanRequest, UserModel
from .serializers import LoanRequestSerializer, UserSerializer, LoanSerializer, GroupSerializer
from datetime import datetime

rekognition = boto3.client('rekognition', region_name='us-east-1')

# AWS resource identifiers come from the environment so the account id and the
# bucket name are not hardcoded in the source. See .env.example.
DECISION_WORKFLOW_ARN = os.environ.get('DECISION_WORKFLOW_ARN')
S3_BUCKET = os.environ.get('AWS_S3_BUCKET', '')
REKOGNITION_COLLECTION_ID = os.environ.get('REKOGNITION_COLLECTION_ID', 'collection-id')

# Exemplo para Django
from django.http import HttpResponse

def my_view(request):
    response = HttpResponse("Hello, World!")
    response['Cross-Origin-Opener-Policy'] = 'same-origin'  # ou outra política que você precise
    return response


def index_view(request):
    return render(request, 'frontend/index.html')  # Ajuste o caminho conforme necessário


def get_aws_profile_name():
    config = configparser.ConfigParser()
    credentials_path = os.path.expanduser('~/.aws/credentials')  # Expand the ~ to the full path
    config.read(credentials_path)
    print(config.read(credentials_path))
    profile_name = config.sections()[0]  # Assuming the first section is the profile name
    print(profile_name)
    return profile_name

def list_collections():
    profile_name = get_aws_profile_name()
    print('Using AWS profile:', 'default')
    session = boto3.Session(profile_name=profile_name, region_name='us-east-1')
    client = session.client('rekognition')
    
    # List collections
    print('Listing collections:')
    response = client.list_collections()
    return response['CollectionIds']

def create_collection(collection_id):
    if collection_id not in list_collections():
        response = rekognition.create_collection(CollectionId=collection_id)
        return response
    return {'message': 'Collection already exists'}

def index_faces(bucket, photos, collection_id):
    indexed_faces = []
    for photo in photos:
        response = rekognition.index_faces(
            CollectionId=collection_id,
            Image={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': photo,
                }
            },
            ExternalImageId=photo.split('.')[0],  # Use the photo name (without extension) as the external ID
            DetectionAttributes=['ALL']
        )
        indexed_faces.append(response)
    return indexed_faces

# -- Bucket and Collection_Id are fixed. They won't be requested by the user.
@api_view(['POST'])
def index_faces_view(request):
    bucket = request.data.get('bucket', S3_BUCKET)
    photos = request.data.get('photos', ['Kylie_Jenner.jpg'])
    collection_id = request.data.get('collection_id', REKOGNITION_COLLECTION_ID)
    
    missing_params = []
    if not bucket:
        missing_params.append('bucket')
    if not photos:
        missing_params.append('photos')
    if not collection_id:
        missing_params.append('collection_id')

    if missing_params:
        return JsonResponse({'error': f'Missing required parameters: {", ".join(missing_params)}'}, status=400)

    # Create collection if collection_id does not exist
    if collection_id not in list_collections():
        create_collection(collection_id) # mudar create collections
        
    indexed_faces = index_faces(bucket, photos, collection_id)
    return Response({'indexed_faces': indexed_faces})

def associate_face(collection_id, face_id, user_id):
    response = rekognition.associate_faces(
        CollectionId=collection_id,
        FaceId=face_id,
        UserId=user_id
    )
    return response

# -- Bucket and Collection_Id are fixed. They won't be requested by the user.
# Ainda a ponderar se deixo esta funçao ou apago
@api_view(['POST'])
def associate_face_view(request):
    collection_id = request.data.get('collection_id', REKOGNITION_COLLECTION_ID)
    face_id = request.data.get('face_id')
    user_id = request.data.get('user_id')
    
    if not collection_id or not face_id or not user_id:
        return JsonResponse({'error': 'Missing required parameters'}, status=400)
    
    response = associate_face(collection_id, face_id, user_id)
    return Response(response)


# ----------------- LOGIN VIEWS -----------------

# ao fazer login inserimos o >username< e a foto
# sabemos previamente que o username está associado a um face_id
# ao enviar a foto para o eb, veremos se está associada ao face_id do username
from django.http import JsonResponse
from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt
from botocore.exceptions import ClientError
import boto3
from .models import UserModel
from rest_framework.authtoken.models import Token

@csrf_exempt
def login_view_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        photo = request.FILES.get('file')

        if not (username and photo):
            return JsonResponse({'message': 'Username and photo are required'}, status=400)
        
        try:
            # Check faceid related to username in sqlite
            user = UserModel.objects.get(username=username)
            user_face_id = user.face_id

            # Read the uploaded photo into memory
            photo_bytes = photo.read()

            # Custom authentication logic
            rekognition = boto3.client('rekognition', region_name='us-east-1')
            collection_id = REKOGNITION_COLLECTION_ID
            try:
                response = rekognition.search_faces_by_image(
                    CollectionId=collection_id,
                    Image={'Bytes': photo_bytes}
                )
                if response['FaceMatches']:
                    matched_face_id = response['FaceMatches'][0]['Face']['FaceId']
                    if matched_face_id == user_face_id:
                        token, _ = Token.objects.get_or_create(user=user)
                        login(request, user)
                        return JsonResponse({'message': 'Login correto', 'token': token.key, 'face_id': user_face_id})
                    else:
                        return JsonResponse({'message': 'Face not recognized'}, status=400)
                else:
                    return JsonResponse({'message': 'No faces detected in the image'}, status=400)
            except ClientError as e:
                if e.response['Error']['Code'] == 'InvalidParameterException':
                    return JsonResponse({'message': 'No faces detected in the image'}, status=400)
                else:
                    return JsonResponse({'message': 'An error occurred', 'error': str(e)}, status=500)
                
        except UserModel.DoesNotExist:
            return JsonResponse({'message': 'Invalid credentials'}, status=400)

    return render(request, 'frontend/login-cliente1.html')


"""@csrf_exempt
def login_view_agent(request):
    print("bdjwnejdfkneqwk,dnklw")
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = UserModel.objects.get(username=username)

        if not (username and password):
            return JsonResponse({'message': 'Username and password are required'}, status=400)

        if not user.is_staff:
            return JsonResponse({'message': 'User is not Agent. Try regular login'}, status=400)

        user = authenticate(username=username, password=password)
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            login(request, user)
            return JsonResponse({'token': token.key})
        else:
            return JsonResponse({'message': 'Invalid credentials'}, status=400)

    return render(request, 'frontend/login-agente.html')"""

 # Exclui a verificação CSRF, mas é importante proteger isso em produção
def login_view_agent(request):
    if request.method == 'POST':
        try:
            # Carregar os dados da requisição como JSON
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            # Verifica se as credenciais foram enviadas
            if not (username and password):
                return JsonResponse({'message': 'Username and password are required'}, status=400)

            # Tenta buscar o usuário
            user = authenticate(username=username, password=password)
            if user is not None:
                # Se o usuário for autenticado, gera ou pega o token
                token, _ = Token.objects.get_or_create(user=user)
                # Se o usuário for um "agente" (is_staff)
                if not user.is_staff:
                    return JsonResponse({'message': 'User is not an Agent. Try regular login'}, status=400)
                
                login(request, user)  # Realiza o login
                return JsonResponse({'token': token.key})  # Retorna o token em formato JSON

            # Caso as credenciais sejam inválidas
            return JsonResponse({'message': 'Invalid credentials'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON in request body'}, status=400)

    return render(request, 'frontend/login-agente.html')
@api_view(['POST'])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logout successful'})
   
@api_view(['GET'])
def list_users(request):
    users = UserModel.objects.all()
    user_data = [{'username': user.username, 'email': user.email} for user in users]
    return Response(user_data)

# -- not needed anymore
# @api_view(['POST'])
# def signup(request):
#     serializer = UserSerializer(data=request.data)
#     if not serializer.is_valid():
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     serializer.save()
#     user = UserModel.objects.get(username=serializer.data.get('username'))
#     user.set_password(request.data.get('password'))
#     user.save()
#     token = Token.objects.create(user=user)
#     return Response({"token": token.key, "user": serializer.data}, status=status.HTTP_201_CREATED)

def search_faces_by_image(bucket, photo, collection_id):
    response = rekognition.search_faces_by_image(
        CollectionId=collection_id,
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': photo,
            }
        },
        FaceMatchThreshold=70,
        # MaxFaces=10
    )
    return response

@api_view(['GET'])
def search_faces_view(request):
    bucket = S3_BUCKET
    photo = 'Taylor_Swift_at_the_2023_MTV_Video_Music_Awards.png'
    collection_id = REKOGNITION_COLLECTION_ID
    
    response = search_faces_by_image(bucket, photo, collection_id)
    return Response(response)

# class UserViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint that allows users to be viewed or edited.
#     """
#     queryset = UserModel.objects.all().order_by('-date_joined')
#     serializer_class = UserSerializer
#     # permission_classes = [permissions.IsAuthenticated]

# class GroupViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint that allows groups to be viewed or edited.
#     """
#     queryset = Group.objects.all().order_by('name')
#     serializer_class = GroupSerializer
#     permission_classes = [permissions.IsAuthenticated]

# -- Loan not 100% functional yet. WIP. 

# class LoanViewSet(viewsets.ModelViewSet):
#     queryset = Loan.objects.all()
#     serializer_class = LoanSerializer

#     def create(self, request, *args, **kwargs):
#         response = super().create(request, *args, **kwargs)
#         cache.set('last_loan_data', request.data, timeout=60*60)  # Cache for 1 hour
#         return response

#     @api_view(['GET'])
#     def get_last_loan_data(request):
#         last_loan_data = cache.get('last_loan_data')
#         if last_loan_data:
#             return Response(last_loan_data)
#         return Response({'message': 'No cached data found'}, status=status.HTTP_404_NOT_FOUND)
    
# class LoanRequestViewSet(viewsets.ModelViewSet):
#     queryset = LoanRequest.objects.all()
#     serializer_class = LoanRequestSerializer

@api_view(['GET'])
def current_datetime(request):
    return Response({'date': datetime.datetime.now()})


#------------------ DASHBOARD AGENTE ------------

#@csrf_exempt  # Exclui a verificação CSRF, mas é importante proteger isso em produção
def dashboard_agent(request):
    if request.method == 'POST':
        pass

    return render(request, 'frontend/dashboard-agente.html')

def dashboard_client(request):
    # Aqui você pode adicionar qualquer lógica adicional que precisar
    # Se precisar verificar se o usuário está autenticado, faça isso aqui
    
    return render(request, 'frontend/dashboard-cliente.html')

def dashboard_client(request):
    # Aqui você pode adicionar qualquer lógica adicional que precisar
    # Se precisar verificar se o usuário está autenticado, faça isso aqui
    
    return render(request, 'frontend/dashboard-cliente.html')

def login2(request):
    # Aqui você pode adicionar qualquer lógica adicional que precisar
    # Se precisar verificar se o usuário está autenticado, faça isso aqui
    
    return render(request, 'frontend/login-cliente.html')
#------------------ DOCUMENTOS CLIENTE ------------

@csrf_exempt  # Exclui a verificação CSRF, mas é importante proteger isso em produção
def doc_cliente(request):
    
    #return JsonResponse({'message': request.method})
    if request.method == 'POST':
        
        try:
            # Carregar os dados da requisição + cookies como JSON
            raw_body = request.body
            print ("raw_data", raw_body) # debug
            data = json.loads(raw_body.decode('utf-8')) 
            print("Parsed JSON data:", data)  # For debugging
            
            # Extract and decode cookies
            cookies = cookie_data(request)
            user_data = cookies.get('userData1')
            if user_data:
                user_data_decoded = urllib.parse.unquote(user_data)  # URL decode
                user_data_json = json.loads(user_data_decoded)  # JSON decode
                print("Decoded user data:", user_data_json)  # Debugging decoded user data

                # Access specific data from the decoded JSON
                face_id = user_data_json.get('face_id')
                print("Face ID cookie:", face_id)  # Debugging a specific cookie
            
            loan_data = cookies.get('loanData')
            if loan_data:
                loan_data_decoded = urllib.parse.unquote(loan_data)
                loan_data_json = json.loads(loan_data_decoded)
                print("Decoded loan data:", loan_data_json)
                initial_amount = loan_data_json.get('amount')
                float_initial_amount = float(initial_amount.replace(',', '.'))

                duration = loan_data_json.get('duration')
                print ("The duration is: " +duration)
                
                installment = loan_data_json.get('installment')
                float_installment = float(installment.replace(',', '.'))
                amount_with_interest = loan_data_json.get('interestAmount')
                float_amount_with_interest = float(amount_with_interest.replace(',', '.'))
                
            
            income = data.get('income')
            float_income = float(income.replace(',', '.'))
            expenses = data.get('expenses')
            float_expenses = float(expenses.replace(',', '.'))            
            
            # Data atual e outros campos padrão
            loan_date = datetime.now()
            agent_id = 3

            # Verificar se todos os campos obrigatórios estão preenchidos
            if not (face_id and initial_amount and amount_with_interest and 
                    duration and installment and income and expenses):
                return JsonResponse({'message': 'Todos os campos são obrigatórios.'}, status=400)
            
            # ACRESCENTAR UM FAIL-SAFE PARA QUANDO O FACE_ID JA TEM UM LOAN REQUEST PENDENTE/ACEITE (PARA O FINAL)
            
            try:
                # Initialize the Step Functions client
                client1 = boto3.client('stepfunctions', region_name='us-east-1')

                # Start the Step Functions execution
                response = client1.start_execution(
                    stateMachineArn=DECISION_WORKFLOW_ARN,
                    # name='Decision_Workflow_ES',
                    input=json.dumps({
                        'salary': float_income,
                        'monthly_payment': float_installment
                    })
                )
                print("Step Function Execution started successfully:", response)

            except NoCredentialsError:
                print("Error: No AWS credentials found. Check your AWS configuration.")

            except PartialCredentialsError:
                print("Error: Incomplete AWS credentials provided. Check your AWS configuration.")

            except ClientError as e:
                error_code = e.response['Error']['Code']
                error_message = e.response['Error']['Message']
                print(f"ClientError occurred: {error_code} - {error_message}")
                if error_code == "AccessDeniedException":
                    print("Access denied. Check the IAM role or user permissions.")
                elif error_code == "InvalidArnException":
                    print("Invalid ARN format. Verify the ARN of the state machine.")
                elif error_code == "StateMachineDoesNotExist":
                    print("The specified state machine does not exist. Verify the ARN.")
                elif error_code == "ExecutionAlreadyExists":
                    print("An execution with the same name already exists. Use a unique name.")
                else:
                    print("An unexpected ClientError occurred.")

            except Exception as e:
                print(f"An unexpected error occurred: {str(e)}")
            print('execution started')
            execution_arn = response['executionArn']

             # Poll the execution status until it reaches a terminal state
            while True:
                response2 = client1.describe_execution(
                    executionArn=execution_arn
                )
                status = response2['status']
                if status in ['SUCCEEDED', 'FAILED', 'TIMED_OUT']:
                    break
                time.sleep(5)  # Wait for 5 seconds before polling again

            # Return the output field from the describe_execution response
            output = json.loads(response2.get('output', '{}'))
            print(output)
        
            loan_data = {
                'face_id':face_id,
                'initial_amount':float_initial_amount,
                'amount_with_interest':float_amount_with_interest,
                'duration':duration,
                'installment':float_installment,
                'income':float_income,
                'expenses':float_expenses,
                'loan_date':loan_date,
                'agent_id':agent_id,
                'status':output['message']
            }
            
            print('loan_data criado')
            serializer = LoanSerializer(data=loan_data)
            if serializer.is_valid():
                loan = serializer.save()  # Save the loan instance
                
                            # Create registry na table LoanRequest
 
                return JsonResponse({'message': 'Loan created successfully!', 'id': loan.id}, status=201)
            else:
                return JsonResponse({'message': 'Invalid data', 'errors': serializer.errors}, status=400)
            
        #     return JsonResponse({'executionArn': execution_arn, 'output': output}, status=200)
        # except Exception as e:
        #     return JsonResponse({'error': str(e)}, status=500)
            
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'Erro inesperado: {str(e)}'}, status=500)
        
    # Renderizar a página inicial para requisições GET
    return render(request, 'frontend/documentos.html')

#----------  Update da data entrevista ---------------
def update_interview_date(request, face_id):
    if request.method == "POST":
        try:
            # Parse os dados do corpo da requisição
            data = json.loads(request.body)
            interview_date = data.get("interview_date")

            if not interview_date:
                return JsonResponse({"error": "Interview date is required"}, status=400)

            # Atualiza o registro correspondente
            entrevista = LoanRequest.objects.filter(id=face_id).first()
            if not entrevista:
                return JsonResponse({"error": "Interview not found"}, status=404)

            entrevista.interview_datetime = interview_date
            entrevista.save()

            return JsonResponse({"message": "Interview date updated successfully"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid method"}, status=405)

def EmprestimoByFaceIDView(self, request, face_id):
    if request.method == "GET":
        try:
            emp = LoanRequest.objects.get(face_id=face_id)
            return Response({
                "dataEmp": emp.dataEmp,
                "valorInicial": emp.initial_amount,
                "valorComJuro": emp.amount_with_interest,
                "duracao": emp.duration,
                "prestacao": emp.installment,
                "status":emp.status,
                "entrevista":emp.interview_datetime,
            }, status=status.HTTP_200_OK)
        except LoanRequest.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    return render(request, 'frontend/dashboard-cliente.html') 
    
#----------------- dashboard agent ---------------

def get_emprestimos_by_agent(request, agent_id):
    emprestimos = LoanRequest.objects.filter(agent_id=agent_id).values()  # Retorna todos os campos como dicionário
    return JsonResponse(list(emprestimos), safe=False)


def get_emprestimos_by_client(request):
    face_id = request.GET.get('face_id')
    if not face_id:
        return JsonResponse({'error': 'Face ID not provided'}, status=400)

    loans = LoanRequest.objects.filter(face_id=face_id)
    if not loans.exists():
        return JsonResponse({'error': 'No loan requests found'}, status=404)

    data = list(loans.values())
    return JsonResponse(data, safe=False)



# ----------------- AWS API VIEWS -----------------

@api_view(['GET'])
def photo_count(request):
    s3 = boto3.client('s3')
    bucket_name = S3_BUCKET
    response = s3.list_objects_v2(Bucket=bucket_name)
    count = response.get('KeyCount', 0)
    return Response({'photo_count': count})

def cookie_data(request):
    # Extract cookies from the request
    cookies = {key: request.COOKIES.get(key) for key in request.COOKIES}
    return cookies

@api_view(['GET'])
def get_all_loan_requests(request): # in the database rds
    loan_requests = LoanRequest.objects.all()
    serializer = LoanSerializer(loan_requests, many=True)
    return Response(serializer.data)
    
@api_view(['GET'])
def view_users(request):
    users = UserModel.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
