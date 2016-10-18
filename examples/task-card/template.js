
let taskList = new ReactiveHbs({
   template: '#cards-list',
   container: '.cards-list-mount',
   data: {
      taskCards: [
         {
            title: 'Can be anyting here',
            comments: [],
            labels: ['#00C2E0', 'green'],
         },
         
         {
            title: 'Can be anyting here 2',
            comments: [],
            labels: [],
         },
         
         {
            title: 'Can be anyting here 3',
            comments: ['comment1'],
            labels: [],
         }
      ]
   }
});

taskList.helpers({
   commentsCount(comments) {
      if ( comments.length ) return comments.length;
      return 0;
   },
               
   hasComments(comments) {
      return ( comments.length );
   }
});

taskList.events({
   'click .task-card': function(e, elm, tpl) {
      e.preventDefault();
      let index = $(elm).attr('data-index'),
            queryStr = 'taskCards.' + index,
            dataObj = {
               task: tpl.get(queryStr),
               index: index
            };
      taskPopup.setData(dataObj);
      $('.overlay').show();
      $('.modal').show();
   },
   
   'click [name="addCard"]': function(e, elm, tpl) {
      e.preventDefault();
      $(elm).hide();
      $('[name="card-title"]').val('');
      $('[name="card-title"]').show();
   },
   
   'keyup [name="card-title"]': function(e, elm, tpl) {
      if ( e.keyCode === 13 ) {
         taskList.push('taskCards', {
            title: $(elm).val(),
            description: null,
            comments: [],
            labels: []
         });
         $(elm).hide();
         $('[name="addCard"]').show();
      }
   }
});

taskList.render();

/* ----------  End of task list template  ----------*/


let taskPopup = new ReactiveHbs({
   template: '#card-popup',
   container: '.modal',
   data: {
      allLabels: [
         '#acaaaa', '#00C2E0', '#055A8C', '#89609E', 'orange', 'green', '#f68c9f'
      ]
   }
});

taskPopup.helpers({
   taskHasLabel(label) {
      return _.includes(taskPopup.get('task.labels'), label);
   },
});

taskPopup.onRendered(function() {
   
   $('.modal').on('click', function(e) {
      $('[name="edit-description"]').hide();
      $('.modal .desc-text').show();
      $('input[name="edit-title"]').hide();
      $('.modal p.title').show();
   });
               
   $('[data-dismiss]').on('click', function(e) {
      $('.overlay').hide();
      $('.modal').hide();
   });
   
});

taskPopup.events({
            
   'click input[name="edit-title"]': function(e, elm, tpl) {
      e.stopPropagation();
   },
   
   'keyup input[name="edit-title"]': function(e, elm, tpl) {
      if ( e.keyCode === 13 ) {
         let queryStr = 'taskCards.' + tpl.get('index') + '.title';
         tpl.set('task.title', $(elm).val());
         taskList.set(queryStr, $(elm).val());
      }
   },
   
   'click p.title': function(e, elm, tpl) {
      e.stopPropagation();
      e.stopPropagation();
      $(elm).hide();
      $('.modal input[name="edit-title"]').show();
   },
   
   'click [name="set-label"]': function(e, elm, tpl) {
      if ( _.includes( taskPopup.get('task.labels'), $(elm).attr('data-color') ) ) {
         tpl.pop('task.labels', $(elm).attr('data-color'));
         let query = 'taskCards.' + tpl.get('index') + '.labels';
         taskList.set(query, tpl.get('task.labels'));
      } else {
         tpl.push('task.labels', $(elm).attr('data-color'));
         let query = 'taskCards.' + tpl.get('index') + '.labels';
         taskList.set(query, tpl.get('task.labels'));
      }
   },
   
   'click [name="comment-add"]': function(e, elm, tpl) {
      tpl.push('task.comments', $('[name="comment-val"]').val());
      let query = 'taskCards.' + tpl.get('index') + '.comments';
      taskList.set(query, tpl.get('task.comments'));
   }
     
});

/* ----------  End of task popup template  ----------*/

// overlay events
$('.overlay').on('click', function() {
   $('.overlay').hide();
   $('.modal').hide();
});