# https://dev.to/sauravjaiswalsj/automating-git-push-with-just-a-single-bash-command-460n

# id column is auto added to every models [no need for "id:integer,"]

# also "age:virtual," ",last_updated_age:virtual"

npx sequelize-cli model:generate --name CorpMember --attributes ppa_id:integer,travel_from_city:string,travel_from_state:string,accommodation_location:string,region_street:string,city_or_town:string,email:string,lga:string,stream:string,service_state:string,batch:string,state_code:string,password:string,middle_name:string,first_name:string,last_name:string,email:string,password:string

npx sequelize-cli model:generate --name PPA --attributes name:string,type_of_ppa:string

npx sequelize-cli model:generate --name Accommodation --attributes directions:string,rent:float,state_code:string

npx sequelize-cli model:generate --name Chat --attributes room:string,message:text,message_from:string,message_to:string,media_id:integer,time:string,read_by_to:boolean,time_read:string,_time:string,message_sent:boolean

npx sequelize-cli model:generate --name Sale --attributes state_code:string,item_name:string,price:float,text:text

npx sequelize-cli model:generate --name Location --attributes directions:string

npx sequelize-cli model:generate --name Media --attributes urls:string,alt_text:string

npx sequelize-cli model:generate --name Test --attributes title:string,day:integer