app.service("QuizManager", function($q, $http) {
    var self = this;
    this.quizJSON = {
        "info": {
            "name": "Test Your Knowledge!!",
            "main": "<p>Think you're smart enough to be on Jeopardy? Find out with this super crazy knowledge quiz!</p>",
            "results": "<h5>Learn More</h5><p>Etiam scelerisque, nunc ac egestas consequat, odio nibh euismod nulla, eget auctor orci nibh vel nisi. Aliquam erat volutpat. Mauris vel neque sit amet nunc gravida congue sed sit amet purus.</p>",
            "level1": "Jeopardy Ready",
        },
        "questions": []
        // "questions": [{ // Question 1
            // "q": "What number is the letter A in the English alphabet?",
            // "a": [{
            //         "option": "8",
            //         "correct": false
            //     }, {
            //         "option": "14",
            //         "correct": false
            //     }, {
            //         "option": "1",
            //         "correct": true
            //     }, {
            //         "option": "23",
            //         "correct": false
            //     } // no comma here
            // ],
            // "correct": "<p><span>That's right!</span> The letter A is the first letter in the alphabet!</p>",
            // "incorrect": "<p><span>Uhh no.</span> It's the first letter of the alphabet. Did you actually <em>go</em> to kindergarden?</p>" // no comma here
        // }]
    };
    this.load = function() {
        var deferred = $q.defer();
        $http.jsonp('http://10.16.86.237/drupal/rest/node/8?callback=JSON_CALLBACK').then(function(data) {
            var items = data.data.webform.components;
            var quizs = self.quizJSON.questions;
            angular.forEach(items, function(item, key) {
                console.log(item);
                var obj = {};
                obj.q = item.name;
                obj.key = item.value;
                var answers = [];
                angular.trim
                angular.forEach($.trim(item.extra.items).split("\n"), function(answer, key) {
                    var value = answer.split("|");
                    console.log(value[0] == obj.key)
                    answers.push({
                        "option": value[1],
                        "correct": value[0] == obj.key
                    });
                });
                obj.a = answers
                obj.correct = "correct";
                obj.incorrect = "incorrect";
                quizs.push(obj);
            });
            console.log(quizs)
            deferred.resolve(self.quizJSON);
        });
        return deferred.promise;
    };
});