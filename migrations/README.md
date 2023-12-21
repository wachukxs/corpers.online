# Sequelize Migration and `queryInterface`

## Links
* [Query Interface Intro](https://sequelize.org/docs/v6/other-topics/query-interface/)

* [CLI commands](https://sequelize.org/docs/v7/cli/)

## Bugs
* There might be a bug. When you're creating a foreign key constraint and you add multiple columns in the fields parameter, it throws an error.

A code like this:
```js
module.exports = {
  up: async (queryInterface, Sequelize) => {
        await queryInterface.addConstraint('Chats', {
        type: 'FOREIGN KEY',
        name: 'msg_from_from_with_corp_id',
        fields: ['message_to', 'message_from'], // multiple fields causes the bug
        references: {
        table: 'CorpMembers',
        field: 'state_code'
        },
    })

  },
  down: async (queryInterface, Sequelize) => {
    // ...
  }
};

```

Throws this error:
```
== 20210524108239-1-create-chat: migrating =======
Executing (default): ALTER TABLE `Chats` ADD CONSTRAINT `msg_to_from_with_corp_id` FOREIGN KEY (`message_from`, `message_to`) REFERENCES `CorpMembers` (`state_code`);

ERROR: Incorrect foreign key definition for 'msg_to_from_with_corp_id': Key reference and table reference don't match

error Command failed with exit code 1.
```