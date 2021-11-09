RG=velzy
LOCATION=westus
DBNAME=$RG-db

COSMOS_KEY="find me by running the cosmos script"
COSMOS_URL="mongodb://$DBNAME:$COSMOS_KEY@$DBNAME.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=$DBNAME@" ## Get this from the other script

az group create --name $RG --location $LOCATION

az storage account create \
    --name $RG-store \
    --location $LOCATION \
    --resource-group $RG \
    --sku Standard_LRS


az functionapp create \
    --resource-group $RG \
    --name $RG-api \
    --consumption-plan-location $LOCATION \
    --runtime node \
    --storage-account $RG-store

az functionapp config appsettings set 
    --name $RG-API \
    --resource-group $RG \
    --settings "DATABASE_URL=$COSMOS_URL"

#start up the emulator if you want to
#func azure functionapp publish $RG-api