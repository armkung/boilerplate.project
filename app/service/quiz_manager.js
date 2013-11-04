app.service("QuizManager", function($q, $http, host_drupal) {
    var self = this;
    this.quiz = [{
        question: "ques",
        answer: ["a", "b", "c", "d"]
    }, {
        question: "ques2",
        answer: ["a", "b", "c", "d"]
    }];
    this.node = 8;
    this.load = function() {
        var deferred = $q.defer();
        $http.jsonp(host_drupal + '/drupal/rest/node/' + self.node + '?callback=JSON_CALLBACK').then(function(data) {
            var items = data.data.webform.components;
            var quizs = [];
            angular.forEach(items, function(item, key) {
                console.log(item);
                var obj = {};
                obj.question = item.name;
                var answers = [];
                angular.forEach($.trim(item.extra.items).split("\n"), function(answer, key) {
                    var value = answer.split("|");
                    answers.push(value[1]);
                });
                obj.answer = answers

                quizs.push(obj);
            });
            console.log(quizs)
            deferred.resolve(quizs);
        });
        return deferred.promise;
    };
    // this.load = function() {
    //     var deferred = $q.defer();
    //     $http.jsonp('http://10.16.86.237/drupal/rest/node/8?callback=JSON_CALLBACK').then(function(data) {
    //         var items = data.data.webform.components;
    //         var quizs = self.quizJSON.questions;
    //         angular.forEach(items, function(item, key) {
    //             console.log(item);
    //             var obj = {};
    //             obj.q = item.name;
    //             obj.key = item.value;
    //             var answers = [];
    //             angular.trim
    //             angular.forEach($.trim(item.extra.items).split("\n"), function(answer, key) {
    //                 var value = answer.split("|");
    //                 console.log(value[0] == obj.key)
    //                 answers.push({
    //                     "option": value[1],
    //                     "correct": value[0] == obj.key
    //                 });
    //             });
    //             obj.a = answers
    //             obj.correct = "correct";
    //             obj.incorrect = "incorrect";
    //             quizs.push(obj);
    //         });
    //         console.log(quizs)
    //         deferred.resolve(self.quizJSON);
    //     });
    //     return deferred.promise;
    // };
});