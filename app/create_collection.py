import boto3
import configparser
import os

def get_aws_profile_name():
    config = configparser.ConfigParser()
    credentials_path = os.path.expanduser('~/.aws/credentials')  # Expand the ~ to the full path
    config.read(credentials_path)
    print(config.read(credentials_path))
    profile_name = config.sections()[0]  # Assuming the first section is the profile name
    print(profile_name)
    return profile_name

def create_collection(collection_id):
    profile_name = get_aws_profile_name()
    print('Using AWS profile:', profile_name)
    session = boto3.Session(profile_name=profile_name, region_name='us-east-1')
    client = session.client('rekognition')

    # Create a collection
    print('Creating collection:' + collection_id)
    response = client.create_collection(CollectionId=collection_id)
    print('Collection ARN: ' + response['CollectionArn'])
    print('Status code: ' + str(response['StatusCode']))
    print('Done...')

def delete_collection(collection_id):
    profile_name = get_aws_profile_name()
    print('Using AWS profile:', 'default')
    session = boto3.Session(profile_name=profile_name, region_name='us-east-1')
    client = session.client('rekognition')

    # Delete a collection
    print('Deleting collection:' + collection_id)
    response = client.delete_collection(CollectionId=collection_id)
    print('Status code: ' + str(response['StatusCode']))
    print('Done...')
    
def list_collections():
    profile_name = get_aws_profile_name()
    print('Using AWS profile:', 'default')
    session = boto3.Session(profile_name=profile_name, region_name='us-east-1')
    client = session.client('rekognition')
    
    # List collections
    print('Listing collections:')
    response = client.list_collections()
    print(response['CollectionIds'])
    

def main():
    collection_id = "taylor-swift-id"
    # create_collection(collection_id)
    # Uncomment the line below to delete the collection
    delete_collection(collection_id)

if __name__ == "__main__":
    # main()    
    list_collections()
#    get_aws_profile_name()