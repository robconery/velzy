
#change as you need
RG=velzy
LOCATION=westus
DBNAME=$RG-db

echo "Guessing your external IP address from ipinfo.io"
IP=$(curl -s ipinfo.io/ip)

az group create --name $RG --location $LOCATION

#This might fail if you're not eligible for free tier
#if it does, remove the --enable-free-tier flag
az cosmosdb create -n $DBNAME 
  --enable-free-tier true \
  --ip-range-filter 0.0.0.0,$IP -g $RG \
  --kind MongoDB \

#This command will grab your database keys, which you'll need for your
#Connection string
echo "Pulling your keys from Azure..."
az cosmosdb keys list -n $DBNAME -g $RG --output table
