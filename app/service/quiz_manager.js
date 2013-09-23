app.service("QuizManager", function() {
    this.quizJSON = {
        "info": {
            "name": "Test Your Knowledge!!",
            "main": "<p>Think you're smart enough to be on Jeopardy? Find out with this super crazy knowledge quiz!</p>",
            "results": "<h5>Learn More</h5><p>Etiam scelerisque, nunc ac egestas consequat, odio nibh euismod nulla, eget auctor orci nibh vel nisi. Aliquam erat volutpat. Mauris vel neque sit amet nunc gravida congue sed sit amet purus.</p>",
            "level1": "Jeopardy Ready",
        },
        "questions": [{ // Question 1
            "q": "What number is the letter A in the English alphabet?",
            "a": [{
                    "option": "8",
                    "correct": false
                }, {
                    "option": "14",
                    "correct": false
                }, {
                    "option": "1",
                    "correct": true
                }, {
                    "option": "23",
                    "correct": false
                } // no comma here
            ],
            "correct": "<p><span>That's right!</span> The letter A is the first letter in the alphabet!</p>",
            "incorrect": "<p><span>Uhh no.</span> It's the first letter of the alphabet. Did you actually <em>go</em> to kindergarden?</p>" // no comma here
        }]
    };
});