import boto3

# Especificando a região, por exemplo, 'us-east-1'
client = boto3.client("dynamodb", region_name="us-east-1")

# Listando as tabelas existentes
response = client.list_tables()
print("Tabelas:", response)

# Buscando um item específico
response = client.get_item(
    TableName="Client",
    Key={"ID_cliente": {"N": "1"}},
)

# Acessando os valores de 'ID_cliente', 'Name' e 'Photo'
if 'Item' in response:
    id_cliente = response['Item'].get('ID_cliente', {}).get('N', 'ID não encontrado')
    name = response['Item'].get('Name', {}).get('S', 'Nome não encontrado')
    photo = response['Item'].get('Photo', {}).get('S', 'Foto não encontrada')
    
    print(f"ID Cliente: {id_cliente}")
    print(f"Nome: {name}")
    print(f"Foto: {photo}")
else:
    print("Item não encontrado.")
