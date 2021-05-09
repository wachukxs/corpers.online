npx sequelize-cli db:migrate

npx sequelize-cli db:migrate:undo

# adding new fields
# https://dev.to/nedsoft/add-new-fields-to-existing-sequelize-migration-3527
npx sequelize-cli migration:generate --name adding_new_fields

heroku logs -n 1500 --app corpers-online