# Sequelize quick links

- Understanding [Sequelize relationships](https://sequelize.org/docs/v6/core-concepts/assocs/#defining-the-sequelize-associations)

- To list out all the relations method of a model

```js
// from https://stackoverflow.com/a/55113682/9259701 & https://github.com/sequelize/sequelize/issues/4970#issuecomment-161712562
const __model = db.PPA; // sample model
for (let assoc of Object.keys(__model.associations)) {
  for (let accessor of Object.keys(__model.associations[assoc].accessors)) {
    console.log(
      __model.name +
        "." +
        __model.associations[assoc].accessors[accessor] +
        "()"
    );
  }
}
```

TODO
* Use transactions to run migrations as show in the [sample code](https://sequelize.org/docs/v6/other-topics/migrations/).