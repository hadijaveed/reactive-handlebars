# reactive-handlebars
##### A miniature library to update handlebars templates reactively.

Handlebars is one of the most popular templating engines. Complicated UIs, data visualizations, and systems of calculations are examples of just a few problems where organising code becomes really hard while updating the templates on change.

### How can reactive-handlebars simplify your templates ?
* Updating variables will update their values where used in DOM.
* Maximizing separation of concern and providing clean and declarative way of organizing the code.
* Observing the data passed to the template through observers. (If the listeners are set on object keys that are passed to the template).
* Abstraction over asynchronous HTTP calls by setting promises to the templates.

### Getting Started
#### Install
```
npm install reactive-handlebars
```
#### Dependencies
* jquery
* lodash.js
* handlebars.js

### Usage
Counter Example

##### Initialise
```js
let counter = new ReactiveHbs({
    container: '.mount',
    template: '#tpl',
    data: {
      count: 0
    }
 
});

```
##### Helpers
```js
counter.helpers({
    multiplyByTwo() {
        return counter.get('count') * 2;
    }
});

```

##### Events
```js
counter.events({
    'click [name="increment-count"]': (e, elm, tpl) => {
        tpl.set( 'count', tpl.get('count') + 1 );
    }
});
```

##### Observers
```js
counter.reactOnChange('count', { throttle: 100 }, (tpl) => {
    console.log('count have been changed ', tpl.get('count'));
});

// turn the observer off when not needed
counter.stopReactOnChange('count');
```

### Next Steps
See this [Demo] (http://codepen.io/hjaveed/pen/ZprdyP) 

Check out these [examples] (https://github.com/hadijaveed/reactive-handlebars/tree/master/examples) in the wild





