require('../node_modules/angular/angular.min.js');
require('../node_modules/angular-mocks/angular-mocks.js');
require('../src/mailchimp');

beforeEach(angular.mock.module('mailchimp'));

describe('mailchimpSubscriber service', function () {
    var service, $httpBackend;

    beforeEach(inject(function (mailchimpSubscriber, _$httpBackend_) {
        service = mailchimpSubscriber;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('on subscribe', function () {
        var onSuccessSpy, onErrorSpy, args, endpoint;

        beforeEach(function () {
            onSuccessSpy = jasmine.createSpy();
            onErrorSpy = jasmine.createSpy();
            args = {
                mcUsername: 'username',
                mcDc: 'dc',
                mcU: 'u',
                mcId: 'id',
                data: {
                    custom: 'field'
                },
                onSuccess: onSuccessSpy,
                onError: onErrorSpy
            };
            endpoint = '//username.dc.list-manage.com/subscribe/post-json?c=JSON_CALLBACK&custom=field&id=id&u=u';
        });

        describe('success', function () {
            beforeEach(function () {
                $httpBackend.expectJSONP(endpoint).respond(200);
                service.subscribe(args);
                $httpBackend.flush();
            });

            it('success handler is executed', function () {
                expect(onSuccessSpy).toHaveBeenCalled();
            });
        });

        describe('success with custom message', function () {
            var customMessage;

            beforeEach(function () {
                customMessage = {
                    result: 'success',
                    msg: 'message'
                };
                $httpBackend.expectJSONP(endpoint).respond(200, customMessage);
                service.subscribe(args);
                $httpBackend.flush();
            });

            it('success handler is executed', function () {
                expect(onSuccessSpy.calls.mostRecent().args[0]).toEqual(customMessage);
            });
        });

        describe('error', function () {
            beforeEach(function () {
                $httpBackend.expectJSONP(endpoint).respond(400);
                service.subscribe(args);
                $httpBackend.flush();
            });

            it('error handler is executed', function () {
                expect(onErrorSpy).toHaveBeenCalled();
            });
        });
    });
});

describe('mailchimpSubscriber component', function () {
    var $ctrl, scope, bindings, subscriber;

    beforeEach(inject(function ($componentController) {
        scope = {
            mailchimpSubscriberForm: {
                invalid: {
                    $invalid: true
                },
                valid: {
                    $valid: true
                }
            }
        };
        subscriber = { subscribe: jasmine.createSpy() };

        bindings = {
            mcUsername: 'username',
            mcDc: 'dc',
            mcU: 'u',
            mcId: 'id',
            templateUrl: 'template'
        };

        $ctrl = $componentController('mailchimpSubscriber', { $scope: scope, mailchimpSubscriber: subscriber }, bindings);
        $ctrl.$onInit();
    }));

    it('check for invalid field before submit', function () {
        expect($ctrl.isInvalid('invalid')).toBeFalsy();
    });

    it('check for unknown field before submit', function () {
        expect($ctrl.isInvalid('unknown')).toBeFalsy();
    });

    describe('on submit with invalid form', function () {
        beforeEach(function () {
            $ctrl.submit();
        });

        it('is not working', function () {
            expect($ctrl.isWorking()).toBeFalsy();
        });

        it('violation is available', function () {
            expect($ctrl.violation).toEqual('form.incomplete');
        });

        it('check for invalid field', function () {
            expect($ctrl.isInvalid('invalid')).toBeTruthy();
        });

        it('check for valid field', function () {
            expect($ctrl.isInvalid('valid')).toBeFalsy();
        });

        it('check for unknown field before submit', function () {
            expect($ctrl.isInvalid('unknown')).toBeFalsy();
        });
    });

    describe('on submit with valid form', function () {
        beforeEach(function () {
            scope.mailchimpSubscriberForm.$valid = true;
            $ctrl.data = {
                custom: 'field'
            };
        });

        describe('on success', function () {
            beforeEach(function () {
                var result = { result: 'success' };
                $ctrl.submit();
                subscriber.subscribe.calls.mostRecent().args[0].onSuccess(result);
            });

            it('is subscribed', function () {
                expect($ctrl.subscribed).toBeTruthy();
            });

            it('form is cleared', function () {
                expect($ctrl.data).toEqual({});
            });

            it('check for invalid field', function () {
                expect($ctrl.isInvalid('invalid')).toBeFalsy();
            });
        });

        describe('on success with custom message', function () {
            beforeEach(function () {
                var result = {
                    result: 'success',
                    msg: 'message'
                };
                $ctrl.submit();
                subscriber.subscribe.calls.mostRecent().args[0].onSuccess(result);
            });

            it('is subscribed', function () {
                expect($ctrl.subscribed).toBeTruthy();
            });

            it('custom message is available', function () {
                expect($ctrl.message).toEqual('message');
            });
        });

        describe('on failed', function () {
            beforeEach(function () {
                var result = { result: 'failed' };
                $ctrl.submit();
                subscriber.subscribe.calls.mostRecent().args[0].onSuccess(result);
            });

            it('is not subscribed', function () {
                expect($ctrl.subscribed).toBeFalsy();
            });

            it('violation is available', function () {
                expect($ctrl.violation).toEqual('subscription.failed');
            });
        });

        describe('on failed with custom message', function () {
            beforeEach(function () {
                var result = {
                    result: 'failed',
                    msg: 'message'
                };
                $ctrl.submit();
                subscriber.subscribe.calls.mostRecent().args[0].onSuccess(result);
            });

            it('is not subscribed', function () {
                expect($ctrl.subscribed).toBeFalsy();
            });

            it('custom message is available', function () {
                expect($ctrl.message).toEqual('message');
            });
        });

        describe('on error', function () {
            beforeEach(function () {
                $ctrl.submit();
                subscriber.subscribe.calls.mostRecent().args[0].onError();
            });

            it('is not subscribed', function () {
                expect($ctrl.subscribed).toBeFalsy();
            });

            it('violation is available', function () {
                expect($ctrl.violation).toEqual('subscription.failed');
            });
        });
    });
});