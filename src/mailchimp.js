(function (angular) {
    angular.module('mailchimp', [])
        .component('mailchimpSubscriber', new MailchimpSubscriberComponent());

    function MailchimpSubscriberComponent() {
        this.template = '<form name="mailchimpSubscriberForm" ng-submit="$ctrl.submit()" ng-include="::$ctrl.templateUrl"></form>';

        this.bindings = {
            mcUsername: '@',
            mcDc: '@',
            mcU: '@',
            mcId: '@',
            templateUrl: '@'
        };

        this.controller = ['$http', '$scope', function ($http, $scope) {
            var $ctrl = this, working, submitted;

            $ctrl.$onInit = function () {
                $ctrl.isInvalid = function (field) {
                    return submitted && $scope.mailchimpSubscriberForm[field].$invalid;
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
                        var params = angular.extend($ctrl.data, {
                            u: $ctrl.mcU,
                            id: $ctrl.mcId,
                            c:'JSON_CALLBACK'
                        });

                        $http({
                            url: getEndpoint(),
                            params: params,
                            method: 'JSONP'
                        }).then(onSuccess, onError).finally(stopWorking);
                    } else {
                        $ctrl.violation = 'form.incomplete';
                        stopWorking();
                    }
                };
            };

            function getEndpoint() {
                return 'http://' + $ctrl.mcUsername + '.' + $ctrl.mcDc + '.list-manage.com/subscribe/post-json';
            }

            function onSuccess(result) {
                if(result.data.result === 'success') {
                    onSubscribed();
                    $ctrl.subscribedMessage = result.data.msg;
                }
                else onError();
            }

            function onSubscribed() {
                $ctrl.subscribed = true;
                clearForm();
            }

            function onError() {
                $ctrl.violation = 'subscription.failed';
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