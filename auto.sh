# Now we’ll execute our migration to create the Users table in our database:
npx sequelize-cli db:migrate

npx sequelize-cli db:migrate:undo

# adding new fields
# https://dev.to/nedsoft/add-new-fields-to-existing-sequelize-migration-3527
npx sequelize-cli migration:generate --name created_new_associations

heroku logs -n 1500 --app corpers-online

npx sequelize-cli migration:generate --name starting-again   

npx sequelize-cli db:migrate
