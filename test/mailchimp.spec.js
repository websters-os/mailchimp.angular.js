beforeEach(module('mailchimp'));

describe('mailChimpSubscriber component', function () {
    var $ctrl, $httpBackend, scope, bindings;

    beforeEach(inject(function ($componentController, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
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
        bindings = {
            mcUsername: 'username',
            mcDc: 'dc',
            mcU: 'u',
            mcId: 'id',
            templateUrl: 'template'
        };

        $ctrl = $componentController('mailchimpSubscriber', {$scope: scope}, bindings);
        $ctrl.$onInit();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

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
        var endpoint;

        beforeEach(function () {
            scope.mailchimpSubscriberForm.$valid = true;
            $ctrl.data = {
                custom: 'field'
            };
            endpoint = 'http://username.dc.list-manage.com/subscribe/post-json?c=JSON_CALLBACK&custom=field&id=id&u=u';
        });

        describe('on success', function () {
            beforeEach(function () {
                $httpBackend.expectJSONP(endpoint).respond(200, {result: 'success'});
                $ctrl.submit();
                $httpBackend.flush();
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
                $httpBackend.expectJSONP(endpoint).respond(200, {
                    result: 'success',
                    msg: 'message'
                });
                $ctrl.submit();
                $httpBackend.flush();
            });

            it('is subscribed', function () {
                expect($ctrl.subscribed).toBeTruthy();
            });

            it('custom message is available', function () {
                expect($ctrl.subscribedMessage).toEqual('message');
            });
        });

        describe('on failed', function () {
            beforeEach(function () {
                $httpBackend.expectJSONP(endpoint).respond(200, {result: 'failed'});
                $ctrl.submit();
                $httpBackend.flush();
            });

            it('is not subscribed', function () {
                expect($ctrl.subscribed).toBeFalsy();
            });

            it('violation is available', function () {
                expect($ctrl.violation).toEqual('subscription.failed');
            });
        });

        describe('on error', function () {
            beforeEach(function () {
                $httpBackend.expectJSONP(endpoint).respond(400);
                $ctrl.submit();
                $httpBackend.flush();
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