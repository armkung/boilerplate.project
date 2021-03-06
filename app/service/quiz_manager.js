app.service("QuizManager", ["$q", "$http", "host_drupal",
    function($q, $http, host_drupal) {
        var self = this;
        // this.quiz = [{
        //     question: "ques",
        //     answer: ["a", "b", "c", "d"]
        // }, {
        //     question: "ques2",
        //     answer: ["a", "b", "c", "d"]
        // }];
        this.index = 0;

        this.list = function(name) {
            var deferred = $q.defer();

            $http.jsonp(host_drupal + '/rest/views/list_webform?args=' + name + '&callback=JSON_CALLBACK').then(function(data) {
                var items = data.data;
                var quizs = [];
                angular.forEach(items, function(item, key) {
                    quizs.push({
                        title: item["title"],
                        date: item["updated date"],
                        node: item["nid"]
                    });
                });
                deferred.resolve(quizs);
            });

            return deferred.promise;
        };
        this.load = function() {
            var deferred = $q.defer();
            $http.jsonp(host_drupal + '/rest/node/' + self.node + '?callback=JSON_CALLBACK').then(function(data) {
                var items = data.data.webform.components;
                var quizs = [];
                angular.forEach(items, function(item, key) {
                    var obj = {};
                    obj.question = item.name;
                    var answers = [];
                    angular.forEach($.trim(item.extra.items).split("\n"), function(answer, key) {
                        var value = answer.split("|");
                        answers.push(value[1]);
                    });
                    obj.answer = answers;

                    quizs.push(obj);
                });
                deferred.resolve(quizs);
            });
            return deferred.promise;
        };

        var data = {
            series: [],
            categories: []
        };
        this.setMaxChoice = function(n) {
            for (var i = 1; i <= n; i++) {
                data.series.push(0);
                data.categories.push(i + "");
            }
        };
        this.chartConfig = {
            //Main Highcharts options. Any Highchart options are valid here.
            //will be ovverriden by values specified below.
            options: {
                chart: {
                    type: 'column'
                }
            },

            //Series object - a list of series using normal highcharts series options.
            series: [{
                data: data.series,
                showInLegend: false
            }],
            //Title configuration
            title: {
                text: ''
            },
            //Boolean to control showng loading status on chart
            loading: false,
            //Configuration for the xAxis. Currently only one x axis can be dynamically controlled.
            //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
            xAxis: {
                categories: data.categories,
                title: {
                    text: 'Choices'
                }
            }

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
    }
]);