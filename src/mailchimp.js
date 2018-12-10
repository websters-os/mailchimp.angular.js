(function (angular) {
    angular.module('mailchimp', [])
        .service('mailchimpSubscriber', ['$http', MailchimpSubscriberService])
        .component('mailchimpSubscriber', new MailchimpSubscriberComponent());

    function MailchimpSubscriberService($http) {
        this.subscribe = function (args) {
            var params = angular.extend(args.data, {
                u: args.mcU,
                id: args.mcId,
                c: 'JSON_CALLBACK'
            });

            $http({
                url: getEndpoint(args),
                params: params,
                method: 'JSONP'
            }).then(onSuccess, args.onError);

            function onSuccess(result) {
                args.onSuccess(result.data);
            }
        };

        function getEndpoint(args) {
            return '//' + args.mcUsername + '.' + args.mcDc + '.list-manage.com/subscribe/post-json';
        }
    }

    function MailchimpSubscriberComponent() {
        this.template = '<form name="mailchimpSubscriberForm" ng-submit="$ctrl.submit()"><div ng-include="::$ctrl.templateUrl"></div></form>';

        this.bindings = {
            mcUsername: '@',
            mcDc: '@',
            mcU: '@',
            mcId: '@',
            templateUrl: '@'
        };

        this.controller = ['$scope', 'mailchimpSubscriber', function ($scope, subscriber) {
            var $ctrl = this, working, submitted;

            $ctrl.$onInit = function () {
                $ctrl.isInvalid = function (field) {
                    var form = $scope.mailchimpSubscriberForm;
                    return submitted && form[field] && form[field].$invalid;
                };

                $ctrl.isWorking = function () {
                    return working;
                };

                $ctrl.submit = function () {
                    $ctrl.violation = undefined;
                    $ctrl.subscribed = undefined;
                    $ctrl.subscribedMessage = undefined;
                    submitted = true;
                    startWorking();

                    if ($scope.mailchimpSubscriberForm.$valid) {
                        subscriber.subscribe({
                            mcUsername: $ctrl.mcUsername,
                            mcDc: $ctrl.mcDc,
                            mcU: $ctrl.mcU,
                            mcId: $ctrl.mcId,
                            data: $ctrl.data,
                            onSuccess: onSuccess,
                            onError: onError
                        });
                    } else {
                        $ctrl.violation = 'form.incomplete';
                        stopWorking();
                    }
                };
            };

            function onSuccess(data) {
                if (data.result === 'success') onSubscribed();
                else onError();
                $ctrl.message = data.msg;
            }

            function onSubscribed() {
                $ctrl.subscribed = true;
                submitted = false;
                clearForm();
                stopWorking();
            }

            function onError() {
                $ctrl.violation = 'subscription.failed';
                stopWorking();
            }

            function startWorking() {
                working = true;
            }

            function stopWorking() {
                working = false;
            }

            function clearForm() {
                $ctrl.data = {};
            }
        }];
    }
})(angular);