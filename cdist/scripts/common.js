//新建基础模块
angular.module("dp.ui.base", []);
angular.module("dp.ui.base")
//列表时间
    .filter("listdate", function () {
        return function (input, param) {
            return input ? moment(input).format(param) : "-";
        }
    })
//填充“-”
    .filter("filler", function () {
        return function (input, param) {
            return input ? input : "-";
        }
    })
//分转元
    .filter("coinToDuller", function () {
        return function (input) {
            if (input != "") {
                return (parseInt(input) / 100).toFixed(2);
            } else {
                return "0.00";
            }
        }
    });
angular.module("dp.ui.base")
    .directive("dpBooleanAdapter", function () {
        return {
            restrict: 'AE',
            scope: {},
            require: '?^ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$formatters.push(function (value) {
                    return !!value;
                });
                ctrl.$parsers.push(function (value) {
                    return String(value) == "true" ? 1 : 0;
                });
                ctrl.$render = function () {
                    element[0].checked = ctrl.$viewValue;
                }
            }
        }
    });




angular.module("dp.ui.base")
    .directive("dpSmartFloat", ['$timeout', function($timeout) {
        return {
            restrict: 'EA',
            link: function(scope, element, attr) {
                var DEFAULTS = {
                    type: 'top',
                    distance: 0
                };
                var options;
                var windowHeight = $(window).height();


                //获取参数配置项
                scope.$watchCollection(attr.dpSmartFloat, function(option) {
                    if (angular.isObject(option)) {
                        options = angular.extend(angular.copy(DEFAULTS), option);
                    } else {
                        throw new Error('Invalid value for smart-float. smart-float only accepts object params.');
                    }
                }, true);

                function position() {
                    windowHeight = $(window).height();
                    if (element.is(":hidden")) {
                        return;
                    }
                    var elementWidth = element.outerWidth();
                    var elementHeight = element.outerHeight();
                    var referElement = element.parent(); //参照元素
                    var referElementWidth = element.parent().width(); //参照元素
                    var referPos = referElement.offset().top + elementHeight; //参照距离
                    referElement.css('height', elementHeight + 'px');
                    var scrollTop = $(this).scrollTop();
                    if (options.type == 'top') {
                        if (scrollTop > referPos) {
                            element.addClass("smart-float-top");
                            element.css({
                                position: 'fixed',
                                top: options.distance + 'px',
                                width: referElementWidth,
                                'z-index': '100'
                            });
                        } else {
                            element.removeClass("smart-float-top");
                            element.css({
                                position: 'static'
                            });
                        }
                    }
                    if (options.type == 'bottom') {
                        //超出一屏可视区大小&&未滚动到最底部一屏
                        if ((windowHeight < referElement.offset().top) && ((scrollTop + windowHeight) < referPos)) {
                            element.addClass("smart-float-bottom");
                            element.css({
                                position: 'fixed',
                                bottom: 0,
                                width: referElementWidth,
                                'z-index': '100',
                                "height": "60",
                                "background": "#f3f3f3",
                                "padding": "0px 10px",
                                "line-height": "56px",
                                "border": "1px solid# ddd",
                                "border-top": "2px solid rgb(64,161,68)"
                            });
                        } else {
                            element.removeClass("smart-float-bottom");
                            element.css({
                                position: 'inherit'
                            });
                        }
                    }
                }

                $timeout(function() {
                    $(window).scroll(position);
                }, 3);
                $(window).resize(function() {
                    position();
                });
            }
        }
    }]);

angular.module("dp.ui.base")
    .factory("$advertisement", [function () {
        function create(data) {
            if (!data) {
                return null;
            }
            var template = '<div class="advertisement-box" {{backgroundColor}}>' +
                '<a href="{{url}}"  target="{{target}}">' +
                '<img src="{{img}}"/>' +
                '</a>' +
                '</div>';

            template = template.replace(/\{\{img\}\}/ig, data.content);
            template = template.replace(/\{\{url\}\}/ig, data.link);
            template = template.replace(/\{\{target\}\}/ig, data.target);
            template = template.replace(/\{\{backgroundColor\}\}/ig, 'style="background-color:' + data.backgroundColor + '"');
            return $(template);
        }

        return {
            create: create
        }
    }]);
angular.module("dp.ui.base")
    .factory("$cache", ["$restClient", "$q", function ($restClient, $q) {
    function getKey(callback) {
        return $restClient.post("seller/cache/uuid", null, null, function (data) {
            callback && callback(data.data);
        }).$promise;
    }

    function getCache(key, success, error) {
        var action = {
            successCallback: function (data) {
                success && success(JSON.parse(data.data||null));
            },
            failCallback: function (data) {
                error && error(data.data);
            },
            errorCallback: function (msg) {
                error && error(msg);
            }
        };


        return $restClient.get("seller/cache/data", {
            key: key
        }, action).$promise;

    }

    function setCache(key, type, entity, success, error) {
        var value = JSON.stringify(entity);
        var action = {
            successCallback: function (data) {
                success && success(data.data);
            },
            failCallback: function (data) {
                error && error(data.data);
            },
            errorCallback: function (msg) {
                error && error(msg);
            }
        };

        return $restClient.post("seller/cache/data", null, {
            type: type,
            key: key,
            value: value
        }, action).$promise;
    }

    return {
        getKey: getKey,
        getCache: getCache,
        setCache: setCache
    };
}]);
angular.module("dp.ui.base")
    .factory("$calculate", [function () {
    return {
        floatAdd: function (arg1, arg2) {
            var r1, r2, m;
            try {
                r1 = arg1.toString().split(".")[1].length
            } catch (e) {
                r1 = 0
            }
            try {
                r2 = arg2.toString().split(".")[1].length
            } catch (e) {
                r2 = 0
            }
            m = Math.pow(10, Math.max(r1, r2));
            return (arg1 * m + arg2 * m) / m;
        },
        floatSub: function (arg1, arg2) {
            var r1, r2, m, n;
            try {
                r1 = arg1.toString().split(".")[1].length
            } catch (e) {
                r1 = 0
            }
            try {
                r2 = arg2.toString().split(".")[1].length
            } catch (e) {
                r2 = 0
            }
            m = Math.pow(10, Math.max(r1, r2));
            //动态控制精度长度
            n = (r1 >= r2) ? r1 : r2;
            return ((arg1 * m - arg2 * m) / m).toFixed(n);
        },
        floatMul: function (arg1, arg2) {
            var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
            try {
                m += s1.split(".")[1].length
            } catch (e) {
            }
            try {
                m += s2.split(".")[1].length
            } catch (e) {
            }
            return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        },
        floatDiv: function (arg1, arg2) {
            var t1 = 0, t2 = 0, r1, r2;
            try {
                t1 = arg1.toString().split(".")[1].length
            } catch (e) {
            }
            try {
                t2 = arg2.toString().split(".")[1].length
            } catch (e) {
            }

            r1 = Number(arg1.toString().replace(".", ""));

            r2 = Number(arg2.toString().replace(".", ""));

            return this.floatMul((r1 / r2),Math.pow(10, t2 - t1));
        }
    }
}]);

angular.module("dp.ui.base")
    .factory('$common', ["$calculate", function($calculate) {
        return {
            //字符串转数组
            strToArray: function(str, spliter, format) {
                if (!str) {
                    return [];
                }
                spliter = spliter ? spliter : ",";
                var result = $.trim(str).split(spliter);

                if (typeof format == "function") {
                    $.each(result, function(i, item) {
                        result[i] = format.call(item, item);
                    })
                } else if (format) {
                    $.each(result, function(i, item) {
                        result[i] = parseInt(item);
                    })
                }
                return result;
            },
            //数组转字符串
            arrayToStr: function(array) {
                return array ? array.toString() : "";
            },
            //驼峰转下划线
            camelToUnderline: function(str, upperCase) {
                var reg = /[A-Z]/g;
                str = str.replace(reg, function($0) {
                    return "_" + (upperCase ? $0.toUpperCase : $0);
                });
                return str.toUpperCase();
            },
            //驼峰转横杠
            camelToDash: function(str, upperCase) {
                var reg = /[A-Z]/g;
                return str.replace(reg, function($0) {
                    return "-" + (upperCase ? $0.toUpperCase : $0);
                });
            },
            //下划线转驼峰
            underlineToCamel: function(str) {
                var reg = /\_(\w)/g;
                return str = str.replace(reg, function(all, letter) {
                    return letter.toUpperCase();
                });
            },
            //分钟数转当天时间
            minutesToDate: function(input) {
                var hours = Math.floor(input / 60);
                var minutes = input % 60;
                return moment(new Date()).startOf("day").add(hours, "hours").add(minutes, "minutes")._d;
            },
            //当天时间转化为分钟数
            dateToMinutes: function(date) {
                if (!date) {
                    return 0;
                }
                var result = moment(date);
                return result.get("hours") * 60 + result.get("minutes");
            },
            //毫秒数转为具体天，小时，分钟，秒
            timespanToTime: function(timespan) {
                var days = Math.floor(timespan / (24 * 3600000));
                var hours = Math.floor(timespan % (24 * 3600000) / 3600000);
                var minutes = Math.floor(timespan % 3600000 / 60000);
                var seconds = Math.floor(timespan % 3600000 % 60000 / 1000)
                return {
                    day: days,
                    hour: hours,
                    minute: minutes,
                    second: seconds
                }
            }
        };
    }]);

angular.module("dp.ui.base")
    .factory("$enum", ["$enumData", function($enumData) {
        var enums = [];
        //结构
        //[{key:"key",value:[{key:"subKey",value:"333"}]}]
        function getEnumInner(type) {
            for (var i = 0; i < enums.length; i++) {
                if (enums[i].key == type) {
                    return enums[i];
                }
            }
            return null;
        }

        function setEnum(type, data) {
            if (!(type && data instanceof Array)) {
                throw type + " 枚举类型不能为空，且 枚举数据必须为数组";
            }
            if (this.isExit(type)) {
                var curEnum = getEnumInner(type);
                curEnum.value = data;
            } else {
                var newEnum = {
                    key: type,
                    value: data
                };
                enums.push(newEnum);
            }
        }

        function getEnum(type) {
            if (!type) {
                throw "枚举类型不能为空";
            }

            var result = getEnumInner(type);

            return result ? angular.copy(result.value) : null;
        }

        function isExit(type) {
            for (var i = 0; i < enums.length; i++) {
                if (enums[i].key == type) {
                    return true;
                }
            }
            return false;
        }

        function getEnumDataByKey(type, key) {
            var result = null;
            angular.forEach(enums, function(item) {
                if (item.key == type) {
                    angular.forEach(item.value, function(subItem) {
                        if (subItem.key.toString() == key.toString()) {
                            result = angular.copy(subItem);
                        }
                    })
                }
            });
            return result;
        }

        function getEnumValueByKey(type, key) {
            var data = this.getEnumDataByKey(type, key);
            return data ? typeof(data.value) == "object" ? angular.copy(data.value) : data.value : null;
        }

        function getEnums() {
            return angular.copy(enums);
        }

        function init() {
            enums = $.extend(enums, $enumData);
        }

        init();

        return {
            //获取所有枚举
            getEnums: getEnums,
            //根据type设置枚举
            setEnum: setEnum,
            //根据type获取枚举
            getEnum: getEnum,
            //枚举是否存在
            isExit: isExit,
            //根据type,key获取枚举对象
            getEnumDataByKey: getEnumDataByKey,
            //根据type,key获取枚举值
            getEnumValueByKey: getEnumValueByKey
        };
    }]);
angular.module("dp.ui.base")
    .factory('$judge', ["$restClient", "$q", "$win", function($restClient, $q, $win) {
        function checkAuthorised(type) {
            var deferred = $q.defer();
            var action = {
                successCallback: function(data) {
                    if (data.data.isValid) {
                        deferred.resolve();
                    } else {
                        $win.confirm({
                            img: "images/components/alert/alert-forbid.png",
                            title: "您的操作权限已过期",
                            content: "请点击按钮到新页面进行授权，授权后重新进行操作",
                            closeText: "重新授权",
                            redirect: data.data.redirectUrl
                        });
                        deferred.reject("未授权");
                    }
                },
                errorCallback: function(msg) {
                    deferred.reject(msg.submsg);
                }
            };

            $restClient.get("seller/authorize/check", {
                "action": type || "reward"
            }, action);

            return deferred.promise;
        }

        function isCTypeShop() {
            return $.trim(VENUS_SHOP.type).toUpperCase() == "C";
        }

        return {
            checkAuthorised: checkAuthorised, //判断授权
            isCTypeShop: isCTypeShop //判断店铺类型是否为C
        };
    }]);
angular.module("dp.ui.base")
    .provider("$restClient", function() {

        this.$get = function($resource, $http, $win) {
            $http.defaults.cache = false;
            var httpClient = $resource((ROOT_PATH || "") + "/:module/:target/:intention", null, {
                "update": {
                    method: "PUT"
                },
                "post": {
                    method: "POST"
                },
                "deletes": {
                    method: "DELETE"
                },
                "put": {
                    method: "PUT"
                }
            });

            //获取路径参数
            function getParam(position, array) {
                var name = ["module", "target", "intention"],
                    positionArray = position.split("/"),
                    positionResult = {},
                    param;

                $(positionArray).each(function(i, item) {
                    positionResult[name[i]] = item;
                });

                param = $.extend({}, positionResult, array || {});
                return param;
            }

            //获取相应回调集合
            function getAction(callback, deferred) {
                var options = {};
                var DEFAULTS = {
                    successCallback: null, //成功回调
                    errorCallback: null, //错误回调
                    failCallback: null, //完成动作
                    custom: false, //自定义
                    deferred: deferred
                };

                options = typeof(callback) == "object" ? $.extend({}, DEFAULTS, callback) : $.extend({}, DEFAULTS, {
                    successCallback: callback
                });

                return getCallback(options);
            }


            function globalResolve(data) {
                if (data.resultCode == -1) { //cookie过期
                    location.href = data.resultMessage;
                } else if (data.resultCode == -3) { //需要高级版本
                    $("#globalVersionModal").modal("show");
                } else if (data.resultCode == -6) { //需要C店铺
                    $win.confirm({
                        type: "forbid",
                        title: "此功能暂不支持天猫店铺！",
                        content: " 此功能受淘宝规则限制只适用于淘宝店铺。天猫店铺无法开启此功能"
                    });
                }
            }

            function needGlobalResolve(data) {
                var sourceCode = ["-1", "-3", "-6"];
                return sourceCode.indexOf(String(data.resultCode)) != -1;
            }

            //生成回调
            function getCallback(options) {
                var successHandler, errorHandler;
                var deferred = options.deferred;

                //创建成功回调
                if (options.custom) {
                    successHandler = options.successCallback;
                } else {
                    successHandler = function(data) {
                        if (data.resultCode == 0) {
                            options.successCallback && options.successCallback.call(this, data);
                            deferred && deferred.resolve();
                        }
                        //全局处理    
                        else if (needGlobalResolve(data)) {
                            globalResolve(data);
                            deferred && deferred.resolve();
                        }
                        //执行失败回调
                        else {
                            if (options.failCallback) {
                                options.failCallback && options.failCallback(data);
                                deferred && deferred.reject();
                            } else {
                                $win.alert("失败:"+data.resultMessage);
                                deferred && deferred.reject();
                            }
                        }
                    }
                }
                //创建失败回调
                if (options.errorCallback && typeof options.errorCallback == "function") {
                    deferred && deferred.reject();
                    errorHandler = options.errorCallback;
                } else {
                    errorHandler = function(msg) {
                        deferred && deferred.reject();
                        $win.alert("错误：" + msg.status + "|" + msg.statusText);
                    }
                }

                return {
                    success: successHandler,
                    error: errorHandler
                }
            }

            //获取httpClient
            function getHttpClient(root) {
                return !root ? httpClient : (function() {
                    return $resource((root || "") + "/:module/:target/:intention", null, {
                        "update": {
                            method: "PUT"
                        },
                        "post": {
                            method: "POST"
                        },
                        "deletes": {
                            method: "DELETE"
                        },
                        "put": {
                            method: "PUT"
                        }
                    });
                })();
            }

            return {
                get: function(url, param, action, deferred, root) {
                    var callback = getAction(action, deferred);
                    return getHttpClient(root)["get"](getParam(url, param), callback.success, callback.error);
                },
                post: function(url, param, data, action, deferred, root) {
                    var callback = getAction(action, deferred);
                    return getHttpClient(root)["post"](getParam(url, param), data, callback.success, callback.error);
                },
                put: function(url, param, data, action, deferred, root) {
                    var callback = getAction(action, deferred);
                    return getHttpClient(root)["put"](getParam(url, param), data, callback.success, callback.error);
                },
                deletes: function(url, param, action, deferred, root) {
                    var callback = getAction(action, deferred);
                    return getHttpClient(root)["deletes"](getParam(url, param), callback.success, callback.error);
                },
                save: function(url, param, data, action, deferred, root) {
                    var callback = getAction(action, deferred);
                    return getHttpClient(root)["save"](getParam(url, param), data, callback.success, callback.error);
                },
                remove: function(url, param, action, deferred, root) {
                    var callback = getAction(action, deferred);
                    return getHttpClient(root)["remove"](getParam(url, param), callback.success, callback.error);
                },
                update: function(url, param, data, action, deferred, root) {
                    var callback = getAction(action, deferred);
                    return getHttpClient(root)["update"](getParam(url, param), data, callback.success, callback.error);
                },
                postFormData: function(url, data, action, deferred, root, filesMark) {
                    var callback = getAction(action, deferred);
                    return $http({
                        url: (root || "") + "/" + url,
                        method: 'POST',
                        data: data,
                        transformRequest: function(data) {
                            filesMark = filesMark || "file";
                            var formData = new FormData();
                            angular.forEach(data, function(value, key) {
                                //多文件
                                if (filesMark && key == filesMark && value.length) {
                                    angular.forEach(value, function(file) {
                                        formData.append(key, file);
                                    })
                                } else {
                                    formData.append(key, value);
                                }
                            });
                            return formData;
                        },
                        headers: {
                            'Content-Type': undefined
                        }
                    }).success(callback.success).error(callback.error);
                },
                needGlobalResolve: needGlobalResolve,
                globalResolve: globalResolve
            };
        }

    });

angular.module("dp.ui.base")
    .factory("$smsType", [function() {
        var SMS_TYPE = [{
            value: "ORDER_CREATE_INFORM",
            key: 0,
            name: "下单关怀"
        }, {
            key: 1,
            value: "NON_PAYMENT_INFORM",
            name: "下单后催付"
        }, {
            key: 2,
            value: "AGAIN_NON_PAYMENT_INFORM",
            name: "关闭前催付"
        }, {
            key: 3,
            value: "JHS_NON_PAYMENT_INFORM",
            name: "聚划算催付"
        }, {
            key: 4,
            value: "PRESELL_NON_PAYMENT_INFORM",
            name: "征集预售催付"
        }, {
            key: 5,
            value: "DELIVER_GOODS_INFORM",
            name: "即时发货提醒"
        }, {
            key: 6,
            value: "DELIVERY_INFORM",
            name: "派件提醒"
        }, {
            key: 7,
            value: "SIGN_IN_INFORM",
            name: "包裹签收提醒"
        }, {
            key: 8,
            value: "PAYMENT_INFORM",
            name: "日常付款关怀"
        }, {
            key: 9,
            value: "AFFIRM_GOODS_INFORM",
            name: "回款答谢"
        }, {
            key: 10,
            value: "WAIT_SELLER_AGREE",
            name: "买家申请退款"
        }, {
            key: 11,
            value: "REFUND_SUCCESS",
            name: "退款成功"
        }, {
            key: 12,
            value: "WAIT_BUYER_RETURN_GOODS",
            name: "等待买家退货"
        }, {
            key: 13,
            value: "SELLER_REFUSE_BUYER",
            name: "卖家拒绝退款"
        }, {
            key: 14,
            value: "REMIND_SELLER_INFORM",
            name: "中差评提醒"
        }, {
            key: 15,
            value: "NEUTRAL_BAD_RATE_INFORM",
            name: "中差评安抚"
        }, {
            key: 16,
            value: "GOOD_RATE_INFORM",
            name: "好评提醒"
        }, {
            key: 17,
            value: "NO_RATE_INFORM",
            name: "催好评"
        }, {
            key: 18,
            value: "DELAYED_INFORM",
            name: "延迟发货关怀"
        }, {
            key: 103,
            value: "MANUAL_INFORM",
            name: "手动提醒"
        }, {
            key: 20,
            value: "MARKETING_INFORM",
            name: "营销"
        }, {
            key: 21,
            value: "SEND_CITY",
            name: "同城到达提醒"
        }, {
            key: 22,
            value: "PRESELL_FINAL_NOPAID_INFORM",
            name: "预售催尾款"//万人团预售催尾款
        }, {
            key: 23,
            value: "PRESELL_PAYMENT_INFORM",
            name: "付款关怀"//万人团付款关怀
        }, {
            key: 24,
            value: "PRESELL_PAYMENT_SUCCESS_INFORM",
            name: "征集成功付款关怀"
        }, {
            key: 25,
            value: "PRESELL_PAYMENT_FAILURE_INFORM",
            name: "预售失败关怀"
        }, {
            key: 27,
            value: "PRESELL_FRONT_NOPAID_INFORM",
            name: "预售催订金"
        }, {
            key: 28,
            value: "PRESELL_FRONT_PAID_INFORM",
            name: "预售付订金关怀"
        }, {
            key: 29,
            value: "PRESELL_FINAL_PAID_INFORM",
            name: "预售付尾款关怀"
        }, {
            key: 30,
            value: "RECEIVE_TIME_DELAY_INFORM",
            name: "延长收货时间提醒"
        }, {
            key: 31,
            value: "CUSTOMIZED_PACKAGE_INFORM",
            name: "个性化包裹[不需要发短信]"
        }, {
            key: 32,
            value: "ETICKET_ISSUE_INFORM",
            name: "开票提醒"
        }, {
            key: 33,
            value: "ABNORMAL_LOGISTICS_INFORM",
            name: "异常物流提醒[发给卖家]"
        }, {
            key: 34,
            value: "MEMBER_UPGRADE_INFORM",
            name: "会员升级提醒"
        }, {
            key: 35,
            value: "ABNORMAL_LOGISTICS_INFORM",
            name: "会员降级提醒"
        }, {
            key: 100,
            value: "MARKETING",
            name: "营销"
        }, {
            key: 101,
            value: "UPLOAD_FILE",
            name: "指定发送"
        }, {
            key: 105,
            value: "CONTINUOUS_MARKETING",
            name: "二次营销"
        }, {
            key: 216,
            value: "SHOP_UNION_MARKETING",
            name: "联合营销"
        }];

        function getTypeByName(name) {
            var result = null;
            angular.forEach(SMS_TYPE, function(item) {
                if (item.value == name) {
                    result = angular.copy(item);
                }
            });
            return result;
        }

        function getKeyByName(name) {
            return getTypeByName(name).key;
        }

        function getTypeByValue(type) {
            var result = null;
            angular.forEach(SMS_TYPE, function(item) {
                if (item.key == type) {
                    result = angular.copy(item.value);
                }
            });
            return result;
        }

        return {
            //根据value获取type
            getTypeByName: getTypeByName,
            //根据value获取key
            getKeyByName: getKeyByName,
            //根据key获取value
            getTypeByValue: getTypeByValue
        }
    }]);
angular.module("dp.ui.base")
    .factory("$support", [function () {
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

        if (Sys.ie) {
            Sys.version = parseInt((/msie (\d+)/.exec(ua.toLowerCase()) || [])[1]);
            if (isNaN(Sys.version)) {
                Sys.version = parseInt((/trident\/.*; rv:(\d+)/.exec(ua.toLowerCase()) || [])[1]);
            }
        }

        return Sys;
    }]);





angular.module("dp.ui.base")
    .factory("$win", ["$compile", "$q", "$rootScope", "$modal", function($compile, $q, $rootScope, $modal) {
        return {
            confirm: function(options) {
                var DEFAULTS = {
                    type: "", //anallyze,cancel-send,delay,delete,forbid,less-message,message,no-message,question
                    img: COMMON_SOURCE_PATH + "images/components/alert/alert-question.png", //图标
                    content: "", //内容
                    title: "", //内容标题
                    windowTitle: "系统提醒", //窗口名称
                    closeText: "确定", //确认按钮文本
                    cancelText: "取消", //取消按钮文本
                    showClose: true, //显示确认按钮
                    showCancel: true, //显示取消按钮
                    size: "sm", //尺寸
                    redirect: "", //链接
                    redirectCancel: "" //取消链接
                };
                var sourcePath = COMMON_SOURCE_PATH + "images/components/alert/";
                var options = $.extend({}, DEFAULTS, options);
                if (options.type) {
                    options.img = sourcePath + "alert-" + options.type + ".png";
                }
                return $modal.open({
                    templateUrl: COMMON_SOURCE_PATH + "views/confirm/confirm.html",
                    controller: "confirmCtrl",
                    windowClass: "confirm",
                    size: options.size,
                    resolve: {
                        $data: function() {
                            return {
                                title: options.title,
                                content: options.content,
                                img: options.img,
                                windowTitle: options.windowTitle,
                                closeText: options.closeText,
                                cancelText: options.cancelText,
                                showClose: options.showClose,
                                showCancel: options.showCancel,
                                redirect: options.redirect,
                                redirectCancel: options.redirectCancel
                            };
                        }
                    }
                });
            },
            alert: function(option) {
                var DEFAULTS = {
                    type: "warning", //场景类型：warning,info,danger,success
                    content: "", //内容
                    autoClose: true, //是否自动关闭
                    duration: 5000, //停留时间
                    size: "" //尺寸
                };
                var config = $.extend({}, DEFAULTS, typeof option == "string" ? { content: option } : option);
                var domEl;
                var scope = $rootScope.$new();
                //关闭
                scope.close = function() {
                    domEl.fadeOut(function() {
                        domEl.remove();
                    });
                    scope.$destroy();
                };

                var angularDomEl = angular.element('<div alert></div>');
                angularDomEl.html(config.content);
                angularDomEl.attr({
                    "template-url": COMMON_SOURCE_PATH + "views/alert/alertFixed.html",
                    "type": config.type,
                    "size": config.size,
                    "close": "close(element)"
                });
                //是否自动关闭
                config.autoClose && angularDomEl.attr("dismiss-on-timeout", config.duration);

                domEl = $compile(angularDomEl)(scope);
                domEl.addClass("alert-fixed");
                config.size && domEl.addClass("alert-" + config.size);

                domEl.appendTo($("body"));
            },
            alertSuccess: function(content) {
                this.alert({
                    type: "success",
                    content: content
                })
            },
            alertError: function(content) {
                this.alert({
                    type: "danger",
                    content: content
                })
            },
            alertWarning: function(content) {
                this.alert({
                    type: "warning",
                    content: content
                })
            },
            alertInfo: function(content) {
                this.alert({
                    type: "info",
                    content: content
                })
            },
            prompt: function(options) {
                var DEFAULTS = {
                    templateHeader: '<form class="form-horizontal" w5c-form-validate=""  name="validateForm">' +
                        '<div class="modal-header">' +
                        '    <button type="button" class="close" aria-label="Close" ng-click="cancel()">' +
                        '        <span aria-hidden="true">&times;</span></button>' +
                        '    <h4 class="modal-title">{{data.windowTitle}}</h4>' +
                        '</div>' +
                        '<div class="modal-body">',
                    templateBody:

                        '  <div class="form-group">' +
                        '   <label class="col-xs-3 control-label" ng-show="data.title">{{data.title}}</label>' +
                        '   <div class="col-xs-9">' +
                        '    <textarea class="form-control" placeholder="{{data.placeholder}}" ng-model="data.value" cols="30" rows="5" ></textarea>' +
                        '   </div>' +
                        '  </div>',
                    templateFooter: '</div>' +
                        '<div class="modal-footer">' +
                        '    <div class="text-center">' +
                        '        <a class="btn btn-base btn-sm" w5c-form-submit="save()" ng-show="data.showClose" ng-bind="data.closeText"></a>' +
                        '        <a class="btn btn-default btn-sm" ng-click="cancel()" ng-show="data.showCancel" ng-bind="data.cancelText"></a>' +
                        '    </div>' +
                        '</div>' +
                        '</form>',
                    title: "", //内容标题
                    placeholder: "",
                    windowClass: "prompt",
                    windowTitle: "修改", //窗口名称
                    closeText: "确定", //确认按钮文本
                    cancelText: "取消", //取消按钮文本
                    showClose: true, //显示确认按钮
                    showCancel: true, //显示取消按钮
                    size: "sm" //尺寸

                };
                var options = $.extend({}, DEFAULTS, options);
                var modalInstance = $modal.open({
                    template: options.templateHeader + options.templateBody + options.templateFooter,
                    controller: "promptCtrl",
                    windowClass: options.windowClass,
                    size: options.size,
                    resolve: {
                        data: function() {
                            return {
                                title: options.title,
                                value: options.value,
                                windowTitle: options.windowTitle,
                                closeText: options.closeText,
                                placeholder: options.placeholder,
                                cancelText: options.cancelText,
                                showClose: options.showClose,
                                showCancel: options.showCancel
                            };
                        }
                    }

                });
                return modalInstance;
            },
        };
    }]);

angular.module('ui.bootstrap.alert', [])
    .controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
        $scope.closeable = 'close' in $attrs;
        $scope.size=$attrs.size;
        this.close = $scope.close;
    }])

    .directive('alert', function () {
        return {
            restrict: 'EA',
            controller: 'AlertController',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || COMMON_SOURCE_PATH+'views/alert/alert.html';
            },
            transclude: true,
            replace: true,
            scope: {
                type: '@',
                close: '&'
            }
        };
    })

    .directive('dismissOnTimeout', ['$timeout', function ($timeout) {
        return {
            require: 'alert',
            link: function (scope, element, attrs, alertCtrl) {
                $timeout(function () {
                    alertCtrl.close();
                }, parseInt(attrs.dismissOnTimeout, 10));
            }
        };
    }]);

angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
angular.module('cgBusy', []);

//loosely modeled after angular-promise-tracker
angular.module('cgBusy').factory('_cgBusyTrackerFactory', ['$timeout', '$q', function($timeout, $q) {
    return function() {

        var tracker = {};
        tracker.promises = [];
        tracker.delayPromise = null;
        tracker.durationPromise = null;
        tracker.delayJustFinished = false;

        tracker.reset = function(options) {
            tracker.minDuration = options.minDuration;

            tracker.promises = [];
            angular.forEach(options.promises, function(p) {
                if (!p || p.$cgBusyFulfilled) {
                    return;
                }
                addPromiseLikeThing(p);
            });

            if (tracker.promises.length === 0) {
                //if we have no promises then dont do the delay or duration stuff
                return;
            }

            tracker.delayJustFinished = false;
            if (options.delay) {
                tracker.delayPromise = $timeout(function() {
                    tracker.delayPromise = null;
                    tracker.delayJustFinished = true;
                }, parseInt(options.delay, 10));
            }
            if (options.minDuration) {
                tracker.durationPromise = $timeout(function() {
                    tracker.durationPromise = null;
                }, parseInt(options.minDuration, 10) + (options.delay ? parseInt(options.delay, 10) : 0));
            }
        };

        tracker.isPromise = function(promiseThing) {
            var then = promiseThing && (promiseThing.then || promiseThing.$then ||
                (promiseThing.$promise && promiseThing.$promise.then));

            return typeof then !== 'undefined';
        };

        tracker.callThen = function(promiseThing, success, error) {
            var promise;
            if (promiseThing.then || promiseThing.$then) {
                promise = promiseThing;
            } else if (promiseThing.$promise) {
                promise = promiseThing.$promise;
            } else if (promiseThing.denodeify) {
                promise = $q.when(promiseThing);
            }

            var then = (promise.then || promise.$then);

            then.call(promise, success, error);
        };

        var addPromiseLikeThing = function(promise) {

            if (!tracker.isPromise(promise)) {
                throw new Error('cgBusy expects a promise (or something that has a .promise or .$promise');
            }

            if (tracker.promises.indexOf(promise) !== -1) {
                return;
            }
            tracker.promises.push(promise);

            tracker.callThen(promise, function() {
                promise.$cgBusyFulfilled = true;
                if (tracker.promises.indexOf(promise) === -1) {
                    return;
                }
                tracker.promises.splice(tracker.promises.indexOf(promise), 1);
            }, function() {
                promise.$cgBusyFulfilled = true;
                if (tracker.promises.indexOf(promise) === -1) {
                    return;
                }
                tracker.promises.splice(tracker.promises.indexOf(promise), 1);
            });
        };

        tracker.active = function() {
            if (tracker.delayPromise) {
                return false;
            }

            if (!tracker.delayJustFinished) {
                if (tracker.durationPromise) {
                    return true;
                }
                return tracker.promises.length > 0;
            } else {
                //if both delay and min duration are set, 
                //we don't want to initiate the min duration if the 
                //promise finished before the delay was complete
                tracker.delayJustFinished = false;
                if (tracker.promises.length === 0) {
                    tracker.durationPromise = null;
                }
                return tracker.promises.length > 0;
            }
        };

        return tracker;

    };
}]);

angular.module('cgBusy').value('cgBusyDefaults', {});

angular.module('cgBusy').directive('cgBusy', ['$compile', '$templateCache', 'cgBusyDefaults', '$http', '_cgBusyTrackerFactory',
    function($compile, $templateCache, cgBusyDefaults, $http, _cgBusyTrackerFactory) {
        return {
            restrict: 'A',
            //replace: true,
            link: function(scope, element, attrs, fn) {
                //Apply position:relative to parent element if necessary
                var position = element.css('position');
                if (position === 'static' || position === '' || typeof position === 'undefined') {
                    element.css('position', 'relative');
                }

                var templateElement;
                var backdropElement;
                var currentTemplate;
                var templateScope;
                var backdrop;
                var tracker = _cgBusyTrackerFactory();
                var defaults = {
                    templateUrl: 'angular-busy.html',
                    delay: 0,
                    minDuration: 0,
                    backdrop: true,
                    message: '请稍后...',
                    wrapperClass: 'cg-busy',
                    animationClass: 'cg-busy-animation',
                    progress: 0,
                    type: null,
                    fixed: false
                };

                angular.extend(defaults, cgBusyDefaults);

                scope.$watchCollection(attrs.cgBusy, function(options) {
                    if (!options) {
                        options = {
                            promise: null
                        };
                    }

                    if (angular.isString(options)) {
                        throw new Error('Invalid value for cg-busy. cgBusy no longer accepts string ids to represent promises/trackers.');
                    }

                    //is it an array (of promises) or one promise
                    if (angular.isArray(options) || tracker.isPromise(options)) {
                        options = {
                            promise: options
                        };
                    }

                    if (options.type != null) {
                        options = angular.extend(options, setType(options.type));
                    }

                    options = angular.extend(angular.copy(defaults), options);

                    if (!options.templateUrl) {
                        options.templateUrl = defaults.templateUrl;
                    }

                    if (!angular.isArray(options.promise)) {
                        options.promise = [options.promise];
                    }

                    // options.promise = angular.isArray(options.promise) ? options.promise : [options.promise];
                    // options.message = options.message ? options.message : 'Please Wait...';
                    // options.template = options.template ? options.template : cgBusyTemplateName;
                    // options.minDuration = options.minDuration ? options.minDuration : 0;
                    // options.delay = options.delay ? options.delay : 0;

                    if (!templateScope) {
                        templateScope = scope.$new();
                    }

                    templateScope.$message = options.message;
                    templateScope.$progressValue = options.progressValue;

                    if (!angular.equals(tracker.promises, options.promise)) {
                        tracker.reset({
                            promises: options.promise,
                            delay: options.delay,
                            minDuration: options.minDuration
                        });
                    }

                    templateScope.$cgBusyIsActive = function() {
                        return tracker.active();
                    };


                    if (!templateElement || currentTemplate !== options.templateUrl || backdrop !== options.backdrop) {

                        if (templateElement) {
                            templateElement.remove();
                        }
                        if (backdropElement) {
                            backdropElement.remove();
                        }

                        currentTemplate = options.templateUrl;
                        backdrop = options.backdrop;

                        $http.get(currentTemplate, {
                            cache: $templateCache
                        }).success(function(indicatorTemplate) {

                            options.backdrop = typeof options.backdrop === 'undefined' ? true : options.backdrop;

                            if (options.backdrop) {
                                var backdrop = '<div class="cg-busy cg-busy-backdrop cg-busy-backdrop-animation ng-hide" ng-show="$cgBusyIsActive()"></div>';
                                backdropElement = $compile(backdrop)(templateScope);
                                options.wrapperClass && backdropElement.addClass(options.wrapperClass);
                                options.fixed && backdropElement.addClass("cg-busy-fixed");
                                element.append(backdropElement);
                            }

                            var template = '<div class="cg-busy cg-busy-element ng-hide" ng-show="$cgBusyIsActive()">' + indicatorTemplate + '</div>';
                            templateElement = $compile(template)(templateScope);
                            options.wrapperClass && templateElement.addClass(options.wrapperClass);
                            options.animationClass && templateElement.addClass(options.animationClass);
                            options.fixed && templateElement.addClass("cg-busy-fixed");
                            angular.element(templateElement.children()[0])
                                .css('position', 'absolute')
                                .css('top', 0)
                                .css('left', 0)
                                .css('right', 0)
                                .css('bottom', 0);
                            element.append(templateElement);

                        }).error(function(data) {
                            throw new Error('Template specified for cgBusy (' + options.templateUrl + ') could not be loaded. ' + data);
                        });
                    }

                }, true);

                function setType(type) {
                    switch (type) {
                        case "page":
                            {
                                return {
                                    wrapperClass: "cg-busy-page",
                                    fixed: true
                                }
                            }
                        case "list":
                            {
                                return {
                                    wrapperClass: "cg-busy-list"
                                }
                            }
                        case "inline":
                            {
                                return {
                                    animationClass: false,
                                    backdrop: false,
                                    wrapperClass: 'cg-busy-inline',
                                    templateUrl: COMMON_SOURCE_PATH + 'views/busy/submittingInline.html'
                                }
                            }
                        case "progress":
                            {
                                return {
                                    wrapperClass: 'cg-busy-progress',
                                    templateUrl: COMMON_SOURCE_PATH + 'views/busy/submitting.html'
                                }
                            }
                        case "progressFixed":
                            {
                                return {
                                    wrapperClass: 'cg-busy-progress',
                                    templateUrl: COMMON_SOURCE_PATH + 'views/busy/submitting.html',
                                    fixed: true
                                }
                            }
                    }
                }
            }
        };
    }
]);

angular.module('cgBusy').run(['$templateCache', function($templateCache) {
    'use strict';
    $templateCache.put('angular-busy.html',
        "<div class=\"cg-busy-default-wrapper\">\n" +
        "\n" +
        "   <div class=\"cg-busy-default-sign\">\n" +
        "\n" +
        "      <div class=\"cg-busy-default-spinner\">\n" +
        "         <div class=\"bar1\"></div>\n" +
        "         <div class=\"bar2\"></div>\n" +
        "         <div class=\"bar3\"></div>\n" +
        "         <div class=\"bar4\"></div>\n" +
        "         <div class=\"bar5\"></div>\n" +
        "         <div class=\"bar6\"></div>\n" +
        "         <div class=\"bar7\"></div>\n" +
        "         <div class=\"bar8\"></div>\n" +
        "         <div class=\"bar9\"></div>\n" +
        "         <div class=\"bar10\"></div>\n" +
        "         <div class=\"bar11\"></div>\n" +
        "         <div class=\"bar12\"></div>\n" +
        "      </div>\n" +
        "\n" +
        "      <div class=\"cg-busy-default-text\">{{$message}}</div>\n" +
        "\n" +
        "   </div>\n" +
        "\n" +
        "</div>"
    );

}]);
//兼容IE8
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "")
    };

    String.prototype.trimLeft = function () {
        return this.replace(/(^\s*)/g, "");
    };
    String.prototype.trimRight = function () {
        return this.replace(/(\s*$)/g, "");
    };
}




angular.module("dp.ui.confirm", [])
    .controller("confirmCtrl", ["$scope", "$modal", "$modalInstance", "$data", function($scope, $modal, $modalInstance, $data) {
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        $scope.close = function() {
            $modalInstance.close();
        };

        init();

        function init() {
            $scope.data = $data;
        }
    }]).controller("promptCtrl", ["$scope", "$modal", "$modalInstance", "data", function($scope, $modal, $modalInstance, data) {
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        $scope.save = function() {
            $modalInstance.close(
                $scope.data.value
            );
        };

        init();

        function init() {
            $scope.data = data;
        }
    }]);

/**
 * Created by lenovo on 2016/5/3.
 */
angular.module("dp.ui.cookies", [])
    .factory("$dpCookies", [function () {
        function getCookies(name) {
            var cv = document.cookie.split("; ");//使用"; "分割Cookie
            var cva = [], temp;
            /*循环的得到Cookie名称与值*/
            for (i = 0; i < cv.length; i++) {
                temp = cv[i].split("=");//用"="分割Cookie的名称与值
                cva[temp[0]] = decodeURIComponent(temp[1]);
            }
            if (name) return cva[name];//如果有name则输出这个name的Cookie值
            else return cva;//如果没有name则输出以名称为key，值为Value的数组
        }

        function setCookies(name, value, expires, path, domain, secure) {
            if (!name || !value) return false;//如果没有name和value则返回false
            if (name == "" || value == "") return false;//如果name和value为空则返回false
            /*对于过期时间的处理*/
            if (expires) {
                /*如果是数字则换算成GMT时间，当前时间加上以秒为单位的expires*/
                if (/^[0-9]+$/.test(expires)) {
                    var today = new Date();
                    expires = new Date(today.getTime() + expires * 1000).toGMTString();
                    /*判断expires格式是否正确，不正确则赋值为undefined*/
                } else if (!/^\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(expires)) {
                    expires = undefined;
                }
            }
            /*合并cookie的相关值*/
            var cv = name + "=" + encodeURIComponent(value) + ";"
                + ((expires) ? " expires=" + expires + ";" : "")
                + ((path) ? "path=" + path + ";" : "")
                + ((domain) ? "domain=" + domain + ";" : "")
                + ((secure && secure != 0) ? "secure" : "");
            /*判断Cookie总长度是否大于4K*/
            if (cv.length < 4096) {
                document.cookie = cv;//写入cookie
                return true;
            } else {
                return false;
            }
        }

        function removeCookies(name, path, domain) {
            if (!name) return false;//如果没有name则返回false
            if (name == "") return false;//如果name为空则返回false
            if (!this.getCookies(name)) return false;//如果要删除的name值不存在则返回false
            /*合并Cookie的相关值*/
            document.cookie = name + "=;"
                + ((path) ? "path=" + path + ";" : "")
                + ((domain) ? "domain=" + domain + ";" : "")
                + "expires=Thu, 01-Jan-1970 00:00:01 GMT;";
            return true;

        }

        return {
            get: getCookies,
            set: setCookies,
            remove: removeCookies
        }
    }]);
angular.module("dp.ui.areapicker", [])
    .factory("$areaBox", ["$modal", function ($modal) {
        var DEFAULTS = {
            showRemote: true,//显示港澳台海外
            selectItems: []//已选区域
        };

        return {
            open: function (options) {
                var options = $.extend({}, DEFAULTS, options)
                return $modal.open({
                    templateUrl: COMMON_SOURCE_PATH + 'views/areaBox/areaBox.html',
                    controller: 'areaCtrl',
                    resolve: {
                        $options: function () {
                            return options || {};
                        }
                    },
                    backdrop: true
                })
            }
        }
    }])
    .controller("areaCtrl", ["$scope", "$modalInstance", "$common", "$win", "$options", function ($scope, $modalInstance, $common, $win, $options) {
        $scope.allSelect = false;
        $scope.noneSelect = false;
        $scope.remoteArea = false;//是否偏远地区
        $scope.areas = [
            {
                "name": "华东",
                "select": false,
                "key": "01",
                "province": [
                    {
                        "name": "上海",
                        "select": true,
                        "key": "010",
                        "parent": 0
                    },
                    {
                        "name": "浙江省",
                        "select": true,
                        "key": "011",
                        "parent": 0
                    },
                    {
                        "name": "江苏省",
                        "select": false,
                        "key": "012",
                        "parent": 0
                    },
                    {
                        "name": "安徽省",
                        "select": false,
                        "key": "013",
                        "parent": 0
                    },
                    {
                        "name": "江西省",
                        "select": false,
                        "key": "014",
                        "parent": 0
                    }
                ]
            },
            {
                "name": "华北",
                "select": false,
                "key": "02",
                "province": [
                    {
                        "name": "北京",
                        "select": false,
                        "key": "020",
                        "parent": 1
                    },
                    {
                        "name": "天津",
                        "select": false,
                        "key": "021",
                        "parent": 1
                    },
                    {
                        "name": "河北省",
                        "select": false,
                        "key": "022",
                        "parent": 1
                    },
                    {
                        "name": "山西省",
                        "select": false,
                        "key": "023",
                        "parent": 1
                    },
                    {
                        "name": "山东省",
                        "select": false,
                        "key": "024",
                        "parent": 1
                    },
                    {
                        "name": "内蒙古",
                        "select": false,
                        "key": "025",
                        "parent": 1
                    }
                ]
            },
            {
                "name": "华中",
                "select": false,
                "key": "03",
                "province": [
                    {
                        "name": "湖北省",
                        "select": false,
                        "key": "030",
                        "parent": 2
                    },
                    {
                        "name": "湖南省",
                        "select": false,
                        "key": "031",
                        "parent": 2
                    },
                    {
                        "name": "河南省",
                        "select": false,
                        "key": "032",
                        "parent": 2
                    }
                ]
            },
            {
                "name": "华南",
                "select": false,
                "key": "04",
                "province": [
                    {
                        "name": "广东省",
                        "select": true,
                        "key": "040",
                        "parent": 3
                    },
                    {
                        "name": "广西",
                        "select": false,
                        "key": "041",
                        "parent": 3
                    },
                    {
                        "name": "海南省",
                        "select": false,
                        "key": "042",
                        "parent": 3
                    },
                    {
                        "name": "福建省",
                        "select": false,
                        "key": "043",
                        "parent": 3
                    }
                ]
            },
            {
                "name": "东北",
                "select": false,
                "key": "05",
                "province": [
                    {
                        "name": "吉林省",
                        "select": false,
                        "key": "050",
                        "parent": 4
                    },
                    {
                        "name": "辽宁省",
                        "select": false,
                        "key": "051",
                        "parent": 4
                    },
                    {
                        "name": "黑龙江",
                        "select": false,
                        "key": "052",
                        "parent": 4
                    }
                ]
            },
            {
                "name": "西北",
                "select": false,
                "key": "06",
                "province": [
                    {
                        "name": "陕西省",
                        "select": true,
                        "key": "060",
                        "parent": 5
                    },
                    {
                        "name": "新疆",
                        "select": true,
                        "key": "061",
                        "parent": 5
                    },
                    {
                        "name": "青海省",
                        "select": false,
                        "key": "062",
                        "parent": 5
                    },
                    {
                        "name": "宁夏",
                        "select": false,
                        "key": "063",
                        "parent": 5
                    },
                    {
                        "name": "甘肃省",
                        "select": false,
                        "key": "064",
                        "parent": 5
                    }
                ]
            },
            {
                "name": "西南",
                "select": false,
                "key": "07",
                "province": [
                    {
                        "name": "四川省",
                        "select": true,
                        "key": "070",
                        "parent": 6
                    },
                    {
                        "name": "云南省",
                        "select": true,
                        "key": "071",
                        "parent": 6
                    },
                    {
                        "name": "贵州省",
                        "select": false,
                        "key": "072",
                        "parent": 6
                    },
                    {
                        "name": "西藏",
                        "select": false,
                        "key": "073",
                        "parent": 6
                    },
                    {
                        "name": "重庆",
                        "select": false,
                        "key": "074",
                        "parent": 6
                    }
                ]
            },
            {
                "name": "港澳台",
                "select": false,
                "key": "08",
                "province": [
                    {
                        "name": "香港",
                        "select": false,
                        "key": "080",
                        "parent": 7
                    },
                    {
                        "name": "澳门",
                        "select": false,
                        "key": "081",
                        "parent": 7
                    },
                    {
                        "name": "台湾",
                        "select": false,
                        "key": "082",
                        "parent": 7
                    }
                ]
            },
            {
                "name": "海外",
                "select": false,
                "key": "09",
                "province": [
                    {
                        "name": "海外",
                        "select": false,
                        "key": "090",
                        "parent": 8
                    }
                ]
            }
        ];

        init();

        //全选
        $scope.selectAll = function (event) {
            if ($scope.allSelect) {
                event.preventDefault();
                return;
            }
            selectAll();
        };

        //全不选
        $scope.selectNone = function (event) {
            if ($scope.noneSelect) {
                event.preventDefault();
                return;
            }
            selectNone();
            $scope.remoteArea = false;
        };

        //排除偏远
        $scope.selectFaraway = function () {
            if (!$scope.remoteArea) {//排除
                $scope.remoteArea = true;
                $scope.allSelect = false;
                $scope.noneSelect = false;
                selectAll();
                $scope.areas[5].select = false;
                $scope.areas[5].province[1].select = false;
                $scope.areas[5].province[2].select = false;
                $scope.areas[6].select = false;
                $scope.areas[6].province[1].select = false;
                $scope.areas[6].province[3].select = false;
            } else {//恢复
                $scope.remoteArea = false;
                selectAll();
            }
        };

        //选择区域
        $scope.selectRegion = function (region, status) {
            var choice = !status;
            region.select = choice;
            for (var i = 0; i < region.province.length; i++) {
                region.province[i].select = choice;
            }

            if (choice) {
                $scope.allSelect = isAllOrNoneSelect("all");
                $scope.noneSelect = false;
            } else {
                $scope.allSelect = false;
                $scope.noneSelect = isAllOrNoneSelect("none");
            }
        };

        //选择省份
        $scope.selectState = function (state, status) {
            var choice = !status;
            var region = $scope.areas[state.parent];
            state.select = choice;

            region.select = isRegionSelect(region);
            if (choice) {
                $scope.allSelect = isAllOrNoneSelect("all");
                $scope.noneSelect = false;
            } else {
                $scope.allSelect = false;
                $scope.noneSelect = isAllOrNoneSelect("none");
            }
        };

        $scope.save = function (event) {
            var result = getSelect();
            if (result == "") {
                $win.alert('请至少选择一个地区');
                return;
            }
            $modalInstance.close(result);
        };

        $scope.cancel = function (event) {
            $modalInstance.dismiss();
        };

        function init() {
            //初始化配置项
            $scope.options = $options;
            //初始化已选项
            var selectItems = $common.strToArray($scope.options.selectItems, null);
            render(selectItems);
            selectItems.length == 0 && selectAll();
            //是否支持港澳台，海外
            if (!$scope.options.showRemote) {
                $scope.areas = $scope.areas.filter(function (item) {
                    return item.key != "08" && item.key != "09";
                })
            }
        }

        //初始化区域
        function render(selectedArrays) {
            var isAllSelect = true;
            var length = $scope.areas.length;

            while (length--) {
                var region = $scope.areas[length];
                region.select = initState(region);
                isAllSelect = isAllSelect && region.select;
            }
            return isAllSelect;

            function initState(region) {
                var isAllSelect = true,
                    length = region.province.length;

                while (length--) {
                    var state = region.province[length];
                    state.select = selectedArrays.indexOf(state.name) != -1;
                    isAllSelect = isAllSelect && state.select;
                }
                return isAllSelect;
            }
        }

        //是否全选或者全不选 type true时为判断全选否则判断全部选
        function isAllOrNoneSelect(type) {
            var result = true;
            type = (type == "all");
            //全选
            if (type) {
                for (var i = 0; i < $scope.areas.length; i++) {
                    var region = $scope.areas[i];
                    if (!region.select) {
                        result = false;
                    }
                    for (var j = 0; j < region.province.length; j++) {
                        var state = region.province[j];
                        if (!state.select) {
                            result = false;
                        }
                    }
                }
            } else {
                for (var i = 0; i < $scope.areas.length; i++) {
                    var region = $scope.areas[i];
                    if (region.select) {
                        result = false;
                    }
                    for (var j = 0; j < region.province.length; j++) {
                        var state = region.province[j];
                        if (state.select) {
                            result = false;
                        }
                    }
                }
            }
            return result;
        }

        function selectAll() {
            for (var i = 0; i < $scope.areas.length; i++) {
                var region = $scope.areas[i];
                region.select = true;
                for (var j = 0; j < region.province.length; j++) {
                    region.province[j].select = true;
                }
            }
            $scope.allSelect = true;
            $scope.noneSelect = false;
        }

        function selectNone() {
            for (var i = 0; i < $scope.areas.length; i++) {
                var region = $scope.areas[i];
                region.select = false;
                for (var j = 0; j < region.province.length; j++) {
                    region.province[j].select = false;
                }
            }
            $scope.noneSelect = true;
            $scope.allSelect = false;
        }

        function isRegionSelect(region) {
            var province = region.province;
            var result = true;
            for (var i = 0; i < province.length; i++) {
                result = result && province[i].select;
            }
            return result;
        }

        function getSelect() {
            var result = [];
            angular.forEach($scope.areas, function (region) {
                angular.forEach(region.province, function (state) {
                    if (state.select) {
                        result.push(state.name);
                    }
                })
            });

            return result.toString();
        }
    }]);

angular.module('dp.ui.datepicker', [])
    .factory('dateUtil', [function () {
        var DateUtil = function () {

            /**
             * 判断闰年
             * @param date Date日期对象
             * @return boolean true 或false
             */
            this.isLeapYear = function (date) {
                return (0 == date.getYear() % 4 && ((date.getYear() % 100 != 0) || (date.getYear() % 400 == 0)));
            }

            /**
             * 日期对象转换为指定格式的字符串
             * @param f 日期格式,格式定义如下 yyyy-MM-dd HH:mm:ss
             * @param date Date日期对象, 如果缺省，则为当前时间
             *
             * YYYY/yyyy/YY/yy 表示年份
             * MM/M 月份
             * W/w 星期
             * dd/DD/d/D 日期
             * hh/HH/h/H 时间
             * mm/m 分钟
             * ss/SS/s/S 秒
             * @return string 指定格式的时间字符串
             */
            this.dateToStr = function (formatStr, date) {
                formatStr = arguments[0] || "yyyy-MM-dd HH:mm:ss";
                date = arguments[1] || new Date();
                var str = formatStr;
                var Week = ['日', '一', '二', '三', '四', '五', '六'];
                str = str.replace(/yyyy|YYYY/, date.getFullYear());
                str = str.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100));
                str = str.replace(/MM/, date.getMonth() >= 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1));
                str = str.replace(/M/g, date.getMonth());
                str = str.replace(/w|W/g, Week[date.getDay()]);

                str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
                str = str.replace(/d|D/g, date.getDate());

                str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
                str = str.replace(/h|H/g, date.getHours());
                str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
                str = str.replace(/m/g, date.getMinutes());

                str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
                str = str.replace(/s|S/g, date.getSeconds());

                return str;
            }


            /**
             * 日期计算
             * @param strInterval string  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
             * @param num int
             * @param date Date 日期对象
             * @return Date 返回日期对象
             */
            this.dateAdd = function (strInterval, num, date) {
                date = arguments[2] || new Date();
                switch (strInterval) {
                    case 's':
                        return new Date(date.getTime() + (1000 * num));
                    case 'n':
                        return new Date(date.getTime() + (60000 * num));
                    case 'h':
                        return new Date(date.getTime() + (3600000 * num));
                    case 'd':
                        return new Date(date.getTime() + (86400000 * num));
                    case 'w':
                        return new Date(date.getTime() + ((86400000 * 7) * num));
                    case 'm':
                        return new Date(date.getFullYear(), (date.getMonth()) + num, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
                    case 'y':
                        return new Date((date.getFullYear() + num), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
                }
            }

            /**
             * 比较日期差 dtEnd 格式为日期型或者有效日期格式字符串
             * @param strInterval string  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
             * @param dtStart Date  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
             * @param dtEnd Date  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
             */
            this.dateDiff = function (strInterval, dtStart, dtEnd) {
                switch (strInterval) {
                    case 's':
                        return parseInt((dtEnd - dtStart) / 1000);
                    case 'n':
                        return parseInt((dtEnd - dtStart) / 60000);
                    case 'h':
                        return parseInt((dtEnd - dtStart) / 3600000);
                    case 'd':
                        return parseInt((dtEnd - dtStart) / 86400000);
                    case 'w':
                        return parseInt((dtEnd - dtStart) / (86400000 * 7));
                    case 'm':
                        return (dtEnd.getMonth() + 1) + ((dtEnd.getFullYear() - dtStart.getFullYear()) * 12) - (dtStart.getMonth() + 1);
                    case 'y':
                        return dtEnd.getFullYear() - dtStart.getFullYear();
                }
            }

            /**
             * 字符串转换为日期对象
             * @param date Date 格式为yyyy-MM-dd HH:mm:ss，必须按年月日时分秒的顺序，中间分隔符不限制
             */
            this.strToDate = function (dateStr) {
                var data = dateStr;
                var reCat = /(\d{1,4})/gm;
                var t = data.match(reCat);
                t[1] = t[1] - 1;
                eval('var d = new Date(' + t.join(',') + ');');
                return d;
            }

            /**
             * 把指定格式的字符串转换为日期对象yyyy-MM-dd HH:mm:ss
             *
             */
            this.strFormatToDate = function (formatStr, dateStr) {
                var year = 0;
                var start = -1;
                var len = dateStr.length;
                if ((start = formatStr.indexOf('yyyy')) > -1 && start < len) {
                    year = dateStr.substr(start, 4);
                }
                var month = 0;
                if ((start = formatStr.indexOf('MM')) > -1 && start < len) {
                    month = parseInt(dateStr.substr(start, 2)) - 1;
                }
                var day = 0;
                if ((start = formatStr.indexOf('dd')) > -1 && start < len) {
                    day = parseInt(dateStr.substr(start, 2));
                }
                var hour = 0;
                if (((start = formatStr.indexOf('HH')) > -1 || (start = formatStr.indexOf('hh')) > 1) && start < len) {
                    hour = parseInt(dateStr.substr(start, 2));
                }
                var minute = 0;
                if ((start = formatStr.indexOf('mm')) > -1 && start < len) {
                    minute = dateStr.substr(start, 2);
                }
                var second = 0;
                if ((start = formatStr.indexOf('ss')) > -1 && start < len) {
                    second = dateStr.substr(start, 2);
                }
                return new Date(year, month, day, hour, minute, second);
            }


            /**
             * 日期对象转换为毫秒数
             */
            this.dateToLong = function (date) {
                return date.getTime();
            }

            /**
             * 毫秒转换为日期对象
             * @param dateVal number 日期的毫秒数
             */
            this.longToDate = function (dateVal) {
                return new Date(dateVal);
            }

            /**
             * 判断字符串是否为日期格式
             * @param str string 字符串
             * @param formatStr string 日期格式， 如下 yyyy-MM-dd
             */
            this.isDate = function (str, formatStr) {
                if (formatStr == null) {
                    formatStr = "yyyyMMdd";
                }
                var yIndex = formatStr.indexOf("yyyy");
                if (yIndex == -1) {
                    return false;
                }
                var year = str.substring(yIndex, yIndex + 4);
                var mIndex = formatStr.indexOf("MM");
                if (mIndex == -1) {
                    return false;
                }
                var month = str.substring(mIndex, mIndex + 2);
                var dIndex = formatStr.indexOf("dd");
                if (dIndex == -1) {
                    return false;
                }
                var day = str.substring(dIndex, dIndex + 2);
                if (!isNumber(year) || year > "2100" || year < "1900") {
                    return false;
                }
                if (!isNumber(month) || month > "12" || month < "01") {
                    return false;
                }
                if (day > getMaxDay(year, month) || day < "01") {
                    return false;
                }
                return true;
            }

            this.getMaxDay = function (year, month) {
                if (month == 4 || month == 6 || month == 9 || month == 11)
                    return "30";
                if (month == 2)
                    if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0)
                        return "29";
                    else
                        return "28";
                return "31";
            }
            /**
             *   变量是否为数字
             */
            this.isNumber = function (str) {
                var regExp = /^\d+$/g;
                return regExp.test(str);
            }

            /**
             * 把日期分割成数组 [年、月、日、时、分、秒]
             */
            this.toArray = function (myDate) {
                myDate = arguments[0] || new Date();
                var myArray = Array();
                myArray[0] = myDate.getFullYear();
                myArray[1] = myDate.getMonth();
                myArray[2] = myDate.getDate();
                myArray[3] = myDate.getHours();
                myArray[4] = myDate.getMinutes();
                myArray[5] = myDate.getSeconds();
                return myArray;
            }

            /**
             * 取得日期数据信息
             * 参数 interval 表示数据类型
             * y 年 M月 d日 w星期 ww周 h时 n分 s秒
             */
            this.datePart = function (interval, myDate) {
                myDate = arguments[1] || new Date();
                var partStr = '';
                var Week = ['日', '一', '二', '三', '四', '五', '六'];
                switch (interval) {
                    case 'y':
                        partStr = myDate.getFullYear();
                        break;
                    case 'M':
                        partStr = myDate.getMonth() + 1;
                        break;
                    case 'd':
                        partStr = myDate.getDate();
                        break;
                    case 'w':
                        partStr = Week[myDate.getDay()];
                        break;
                    case 'ww':
                        partStr = myDate.WeekNumOfYear();
                        break;
                    case 'h':
                        partStr = myDate.getHours();
                        break;
                    case 'm':
                        partStr = myDate.getMinutes();
                        break;
                    case 's':
                        partStr = myDate.getSeconds();
                        break;
                }
                return partStr;
            }

            /**
             * 取得当前日期所在月的最大天数
             */
            this.maxDayOfDate = function (date) {
                date = arguments[0] || new Date();
                date.setDate(1);
                date.setMonth(date.getMonth() + 1);
                var time = date.getTime() - 24 * 60 * 60 * 1000;
                var newDate = new Date(time);
                return newDate.getDate();
            }

            return this;
        }();

        return DateUtil;
    }])

    .directive("dpDatepicker", ["dateUtil", function (dateUtil) {
        return {
            restrict: "EA",
            require: "^?ngModel",
            scope: {
                dpDatetimepicker: "="
            },
            link: function (scope, element, attrs, ctrl) {
                var defaultConfig = {
                    dateFmt: "yyyy-MM-dd HH:mm:ss"
                };
                var config = angular.extend({}, defaultConfig, scope.dpDatetimepicker);

                config.onpicked = function (dp) {
                    var value = element.val();
                    if (scope.dpDatetimepicker && scope.dpDatetimepicker.onpicked) {
                        scope.dpDatetimepicker.onpicked.call(element, dp);
                    }

                    ctrl.$setViewValue(value);
                    scope.$apply()
                };

                config.oncleared = function (dp) {
                    var value = element.val();
                    if (scope.dpDatetimepicker && scope.dpDatetimepicker.oncleared) {
                        scope.dpDatetimepicker.onpicked.call(element, dp);
                    }

                    ctrl.$setViewValue(value);
                    scope.$apply()
                };

                ctrl.$parsers.push(function (value) {
                    return value ? dateUtil.strFormatToDate(config.dateFmt, value) : "";
                });

                ctrl.$formatters.unshift(function (value) {
                    return value ? dateUtil.dateToStr(config.dateFmt, value) : "";
                });


                $(element).on("click", function () {
                    WdatePicker(config);
                })
            }
        }
    }]);

angular.module("dp.ui.goodList", [])
    .directive("dpGoodsList", [function() {
        return {
            restrict: "EA",
            controller: "goodsListCtrl",
            templateUrl: function($element, $attrs) {
                return COMMON_SOURCE_PATH + ($attrs.templateUrl || "views/goodsList/goodsList.html");
            },
            scope: {
                output: "=",
                options: "="
            }
        }
    }])
    .controller("goodsListCtrl", ["$scope", "$element", "$attrs", "$restClient", "$win", "$calculate",
        function(scope, element, attrs, $restClient, $win, $calculate) {
            var DEFAULTS = {
                selected: [], //已选商品
                disabled: [], //禁选商品
                source: "", //活动类型
                limitCount: 0, //上限数量
                hiddenCurrent: false, //隐藏本活动宝贝
                hiddenCategory: false, //隐藏同类活动宝贝
                showRelatedPromotion: false, //显示活动信息
                showFloatToolbar: true, //显示浮动栏
                currentId: "" //当前活动Id
            };
            var options = scope.options = $.extend({}, DEFAULTS, scope.options);
            //已选
            scope.selectedItemIds = [];
            //禁选
            scope.exceptedItemIds = [];
            //筛选
            scope.approveStatus = "onsale"; //出售中，库存中
            scope.keyword = ""; //关键字
            scope.batchKeyword = ""; //批量关键字
            scope.category = null; //分类
            scope.from = {
                key: "",
                text: "所有货源"
            }; //货源类型
            scope.minPrice = ""; //最低价格
            scope.maxPrice = ""; //最高价格
            scope.hiddenCategory = false; //隐藏同类活动宝贝
            scope.hiddenCurrent = false; //隐藏本活动宝贝
            scope.isBatch = false;
            //排序
            scope.order = {
                cur: {
                    type: "",
                    direction: "desc"
                }, //当前条件
                listTime: {
                    type: "list_time",
                    direction: "desc"
                }, //最新上架
                num: {
                    type: "num",
                    direction: "desc"
                }, //库存
                modified: {
                    type: "modified",
                    direction: "desc"
                } //最后修改
            };
            //分页相关
            scope.pageNo = 1;
            scope.pageSize = 20;
            scope.count = 0;
            //其他
            scope.list = null;
            scope.isListModel = false;
            scope.categoryEnum = [{
                cid: "",
                isParent: 1,
                name: "选择所有类别",
                parentCid: 0,
                picUrl: "",
                sortOrder: 1,
                type: "manual_type",
                childCids: ""
            }]; //商品分类
            scope.fromEnum = [{
                key: "",
                text: "所有货源"
            }, {
                key: 0,
                text: "非分销商品"
            }, {
                key: 1,
                text: "代销"
            }, {
                key: 2,
                text: "经销"
            }]; //货源类型
            scope.sizeEnum = [10, 20, 50, 100, 200]; //页面尺寸

            //重置搜索条件
            scope.reset = function() {
                scope.approveStatus = "onsale"; //出售中，库存中
                scope.keyword = ""; //关键字
                scope.batchKeyword = ""; //批量关键字
                scope.category = scope.categoryEnum[0]; //分类
                scope.from = {
                    key: "",
                    text: "所有货源"
                }; //货源类型
                scope.minPrice = ""; //最低价格
                scope.maxPrice = ""; //最高价格
                getList(1);
            };
            //获取商品
            scope.getList = getList;
            //选择显示模式
            scope.switchViewModel = function() {
                scope.isListModel = !scope.isListModel;
            };
            //选择分页大小
            scope.switchSizeModel = function(value) {
                scope.pageSize = value;
                getList(1);
            };
            //选择库存状态
            scope.switchApproveStatus = function(value) {
                scope.approveStatus = value;
                getList(1);
            };
            //选择来源
            scope.switchFrom = function(item) {
                scope.from = item;
                getList(1);
            };
            //显示、隐藏本活动商品
            scope.toggleHideCurrent = function() {
                scope.hiddenCurrent = !scope.hiddenCurrent;
                getList(1);
            };
            //显示、隐藏同类活动
            scope.toggleHideCategory = function() {
                scope.hiddenCategory = !scope.hiddenCategory;
                getList(1);
            };
            //排序
            scope.orderBy = function(type) {
                var cur = scope.order.cur;
                if (!type) {
                    scope.order.cur = {
                        type: "",
                        direction: "desc"
                    };
                    getList(1);
                    return;
                }
                if (type == cur.type) {
                    switch (type) {
                        case "list_time":
                            {
                                scope.order.listTime.direction = scope.order.listTime.direction == "asc" ? "desc" : "asc";
                                scope.order.cur = angular.copy(scope.order.listTime);
                                break;
                            }
                        case "modified":
                            {
                                scope.order.modified.direction = scope.order.modified.direction == "asc" ? "desc" : "asc";
                                scope.order.cur = angular.copy(scope.order.modified);
                                break;
                            }
                        case "num":
                            {
                                scope.order.num.direction = scope.order.num.direction == "asc" ? "desc" : "asc";
                                scope.order.cur = angular.copy(scope.order.num);
                                break;
                            }
                    }
                } else {
                    switch (type) {
                        case "list_time":
                            {
                                scope.order.cur = angular.copy(scope.order.listTime);
                                break;
                            }
                        case "modified":
                            {
                                scope.order.cur = angular.copy(scope.order.modified);
                                break;
                            }
                        case "num":
                            {
                                scope.order.cur = angular.copy(scope.order.num);
                                break;
                            }
                    }
                }

                getList(1);
            };
            //选择商品分类
            scope.selectCategory = function(item) {
                scope.category = item;
                getList(1);
            };
            //上一页
            scope.prev = function() {
                var pageCount = Math.ceil(scope.count / scope.pageSize);
                var pageNo = scope.pageNo - 1;
                if (pageNo <= 0) {
                    $win.alert("已经到达第一页");
                    return;
                }

                getList(scope.pageNo = pageNo);
            };
            //下一页
            scope.next = function() {
                var pageCount = Math.ceil(scope.count / scope.pageSize);
                var pageNo = scope.pageNo + 1;
                if (pageNo > pageCount) {
                    $win.alert("已经到达最后一页");
                    return;
                }
                getList(scope.pageNo = pageNo);
            };
            //选择商品
            scope.select = function(item) {
                var existed = scope.outputIds.indexOf(item.id) >= 0;
                //取消选择
                if (existed) {
                    removeItem(item)
                } //选择
                else {
                    addItem(getAddedItem(item));
                }
                setSelectStatus();
            };
            //全选商品
            scope.selectAll = function() {
                scope.allSelected = !scope.allSelected;
                $(scope.list).each(function(index, item) {
                    if (!item.disabled) {
                        //全选
                        if (scope.allSelected && (scope.outputIds.indexOf(item.id) == -1)) {
                            if (scope.options.limitCount && scope.output.length >= scope.options.limitCount) {
                                $win.alert("商品个数不能超过" + scope.options.limitCount + "个");
                                return false;
                            } else {
                                addItem(getAddedItem(item));
                            }
                        }
                        //全部选
                        else if (!scope.allSelected && (scope.outputIds.indexOf(item.id) != -1)) {
                            removeItem(item);
                        }
                    }
                })
            };

            scope.clearAll = function() {
                var confirm = $win.confirm({
                        type: "delete",
                        title: "您确定要清空所有已选的商品吗？",
                        content: "清空后只能重新选择商品"
                    }).result
                    .then(function() {
                        scope.allSelected = false;
                        scope.outputIds = [];
                        scope.output = [];
                        //渲染状态
                        setDisableStatus();
                        setSelectStatus();
                    })
            };

            scope.showSelected = function() {
                scope.selectedModal = !scope.selectedModal;
            };

            scope.removeItem = function(item) {
                removeItem(item);
                setSelectStatus();
            };

            init();

            function init() {
                //是否为促销
                scope.isPromotion = scope.options.source == "discount" || scope.options.source == "reward" || scope.options.source == "showcase" || scope.options.source == "material";
                scope.exceptedItemIds = options.disabled ? (function() {
                    return $.map(options.disabled, function(item) {
                        return typeof item == "object" ? item.id : item;
                    });
                })() : [];

                scope.selectedItemIds = options.selected ? (function() {
                    return $.map(options.selected, function(item) {
                        return typeof item == "object" ? item.id : item;
                    });
                })() : [];

                scope.outputIds = scope.output ? getIds(scope.output) : [];
                //获取商品分类
                scope.category = scope.categoryEnum[0];
                $restClient.get("seller/shopCat", null, function(data) {
                    var source = data.data;
                    source.splice(0, 0, {
                        cid: "",
                        isParent: 1,
                        name: "选择所有类别",
                        parentCid: 0,
                        picUrl: "",
                        sortOrder: 1,
                        type: "manual_type",
                        childCids: ""
                    }, {
                        cid: "-10000",
                        isParent: 1,
                        name: "未分类",
                        parentCid: 0,
                        picUrl: "",
                        sortOrder: 1,
                        type: "manual_type",
                        childCids: "-10000"
                    });
                    scope.categoryEnum = source;
                });
                //获取数据
                getList(1);
                //绑定事件
                bindEvent();
            }

            //获取商品列表
            function getList(pageNo, pageSize, count) {
                var params = {
                    keyword: scope.keyword,
                    pageSize: pageSize || scope.pageSize,
                    pageNo: --pageNo,
                    approveStatus: scope.approveStatus,
                    isFenxiao: scope.from.key,
                    sellerCids: scope.category.childCids,
                    column: scope.order.cur.type,
                    orderby: scope.order.cur.direction,
                    minPrice: Number(scope.minPrice) * 100 || "",
                    maxPrice: Number(scope.maxPrice) * 100 || "",
                    isBatch: scope.isBatch,
                    source: scope.options.source, //商品类别
                    hiddenCategory: scope.hiddenCategory,
                    hiddenCurrent: scope.hiddenCurrent,
                    currentId: scope.options.currentId
                };
                scope.loading = $restClient.post("seller/item/searchItem", null, params, function(data) {
                    scope.list = data.data;
                    scope.pageNo = ++data.pageNo;
                    scope.pageSize = data.pageSize;
                    scope.count = data.count;
                    scope.allSelected = false; //全选参数
                    setDisableStatus();
                    setSelectStatus();
                }).$promise;
            }

            //获取要添加的商品
            function getAddedItem(item) {
                //如果在已选中，使用原来的数据
                var index;
                if ((index = scope.selectedItemIds.indexOf(item.id)) != -1) {
                    return angular.copy(scope.options.selected[index]);
                } else {
                    return item
                }
            }

            //获取输入商品ID集合
            function getIds(items) {
                var ids = [];
                //获取已选择的商品ID
                angular.forEach(items, function(item) {
                    ids.push(item.id);
                });
                return ids;
            }

            //设置勾选状态
            function setSelectStatus() {
                var all = true;
                $(scope.list).each(function(index, item) {
                    var selected = false;
                    if (!item.disabled) {
                        selected = scope.outputIds.indexOf(item.id) != -1;
                        item.selected = selected;
                    } else {
                        selected = item.disabled;
                    }
                    all = all && selected;
                });
                scope.allSelected = all;
            }

            //设置禁选状态
            function setDisableStatus() {
                $(scope.list).each(function(index, item) {
                    item.disabled = scope.exceptedItemIds.indexOf(item.id) != -1 || scope.exceptedItemIds.indexOf(item.id.toString()) != -1;
                });
            }

            function addItem(item) {
                //超过上限
                if (scope.options.limitCount && scope.output.length >= scope.options.limitCount) {
                    $win.alert("商品个数不能超过" + scope.options.limitCount + "个");
                    return;
                }
                if (scope.options.isInsertBefore) {
                    item.selected = true;
                    scope.output.unshift(angular.copy(item));
                    scope.outputIds.unshift(item.id);
                } else {
                    item.selected = true;
                    scope.output.push(angular.copy(item));
                    scope.outputIds.push(item.id);
                }
            }

            function removeItem(item) {
                item.selected = false;

                angular.forEach(scope.output, function(data, index) {
                    if (data.id == item.id) {
                        scope.output.splice(index, 1);
                    }
                });

                angular.forEach(scope.outputIds, function(itemId, index) {
                    if (item.id == itemId) {
                        scope.outputIds.splice(index, 1);
                    }
                });
            }

            function bindEvent() {
                var id = null;
                //绑定浮动工具
                if (scope.options.showFloatToolbar) {
                    $(window).scroll(function() {
                        var $floatToolbar = element.find(".float-toolbar ").eq(0);
                        var $goodList = element.find(".goods-list").eq(0);
                        if (!id) {
                            id = setTimeout(function() {
                                var scrollTop = $(window).scrollTop();
                                var offsetTop = $goodList.offset().top;
                                if (offsetTop - scrollTop <= 70) {
                                    $floatToolbar.addClass("float-toolbar-fixed");
                                } else {
                                    $floatToolbar.removeClass("float-toolbar-fixed");
                                }
                                id = null;
                            }, 5);
                        }
                    });
                }
                //搜索框
                var $commonSearchInput = element.find(".search-input-group .common-search-input"),
                    $batchSearch = element.find(".search-input-group .batch-search"),
                    $batchSearchInput = element.find(".search-input-group .batch-search-input"),
                    $btnClearKeyword = element.find(".search-input-group .btn-clear-keyword");
                $btnClearKeyword.on("click", function() {
                    scope.keyword = "";
                    scope.$apply();
                });

                $commonSearchInput.on("focus", function(event) {
                    $batchSearch.show(300);
                    scope.isBatch = false;
                    scope.$apply();
                }).on("keyup", function(event) {
                    scope.batchKeyword = "";
                    if (event.keyCode == 13) {
                        scope.getList(1);
                    }
                    scope.$apply();
                });

                $(window).on("click", function(event) {
                    if (!$(event.target).hasClass("common-search-input") && !$(event.target).hasClass("batch-search-input")) {
                        $batchSearch.hide(300);
                    }
                });
                //批量关键字输入框
                $batchSearchInput.on("focus", function() {
                    scope.isBatch = true;
                    scope.$apply();
                }).on("keyup", function(event) {
                    //更新keyword
                    var value = $(event.target).val().split("\n");
                    scope.keyword = value.toString();

                    //更新count
                    $batchSearch.find(".counter").html(value.length + "/20");
                    scope.$apply();
                });

                //已参加活动
                element.find(".content").on("mouseenter", ".status", function(event) {
                    $(event.currentTarget).find(".status-list-wrap").show();
                }).on("mouseleave", ".status", function(event) {
                    $(event.currentTarget).find(".status-list-wrap").hide();
                })
            }
        }
    ]);

/**
 * Created by lenovo on 2016/10/21.
 */
angular.module("dp.ui.goodList")
    .factory("$goodsSelector", ["$modal", function ($modal) {
        var DEFAULTS = {
            selected: [],//已选商品
            disabled: [],//禁选商品
            source: "",//活动类型
            limitCount: 0//上限数量
        };

        function getDefaults() {
            return $.extend({}, {
                hiddenCurrent: false,
                hiddenCategory: false,
                showRelatedPromotion: false,
                showFloatToolbar: false,
                currentId: ""//当前活动
            }, DEFAULTS);
        }

        return {
            open: function (options) {
                return $modal.open({
                    templateUrl: COMMON_SOURCE_PATH + 'views/goodsList/goodsSelector.html',
                    controller: 'goodsSelectorCtrl',
                    size: "lg",
                    resolve: {
                        $options: function () {
                            return $.extend({}, getDefaults(), options) || {};
                        }
                    }
                })
            }
        }
    }])
    .controller("goodsSelectorCtrl", ["$scope", "$options", "$modalInstance","$win",
        function ($scope, $options, $modalInstance,$win) {
            var options = $scope.options = $options;

            $scope.save = function () {
                if($scope.output.length==0){
                    $win.alert("请选择商品");

                    return;   
                }

                var result = {
                    items: angular.copy($scope.output),
                    itemIds: $.map($scope.output, function (item) {
                        return item.id;
                    })
                };



                $modalInstance.close(result);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss();
            };

            init();

            function init() {
                //已选商品
                $scope.output = getSelectedItems(options.selected);
            }

            function getSelectedItems(selected) {
                return selected ? $.map(selected, function (item) {
                    return typeof item == "object" ? item : {id: Number(item)};
                }) : [];
            }
        }]);

//操作dom

+function ($) {
    var DEFAULTS = {
        limitHeight: 80
    };

    var Flex = function (element, options) {
        var that = this;
        this.options = $.extend({}, DEFAULTS, options);
        this.$element = $(element);
        this.limitHeight = this.options.limitHeight;

        this.$element.on("click", ".btn-toggle", function (event) {
            that.toggle.call(that);
            event.stopPropagation();
        });
        this.render();
    };

    Flex.prototype.toggle = function () {
        this.isExpand ? this.collapse() : this.expand();
    };

    Flex.prototype.expand = function () {
        this.isExpand = true;
        this.$element.find(".fill").hide();
        this.$element.find(".overflow-content").show();
        this.$element.find(".btn-toggle").text("【收起】");
    };

    Flex.prototype.collapse = function () {
        this.isExpand = false;
        this.$element.find(".fill").show();
        this.$element.find(".overflow-content").hide();
        this.$element.find(".btn-toggle").text("【展开】");
    };

    Flex.prototype.render = function () {
        var height = this.$element.height();
        if (height < this.limitHeight) {
            return;
        }

        var $copy = $(this.$element.get(0).cloneNode(true));
        var count = 3;
        var copyText = $copy.text();
        var copyLength = copyText.length;
        var cur;
        //插入DOM渲染高度
        this.$element.after($copy.hide());

        //循环截取
        while ($copy.height() > this.limitHeight) {
            $copy.text(cur = copyText.substring(0, copyLength - count));
            count += 5;
        }
        var content = this.$element.text();
        this.visibleContent = content.substring(0, content.length - count - 4);
        this.overflowContent = content.substring(content.length - count - 4, content.length);
        this.$element.text(this.visibleContent);
        this.$element.append($('<span class="fill">...<span>'));
        this.$element.append($('<span class="overflow-content"></span>').text(this.overflowContent).hide());
        this.$element.append($('<span class="btn-toggle">【展开】</span>'));
        $copy.remove();
        //设置展开状态
        this.isExpand = false;
    };

    $.fn.flex = function function_name(options) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("dp.flex");
            if (!data) {
                $this.data(data = new Flex(this, options));
            }
            if (typeof options == "string") {
                data[options]();
            }
        })
    };
}(jQuery);

angular.module('dp.ui.flex', [])
    .directive("dpFlex", ["$timeout", function ($timeout) {
        return {
            restrict: "EA",
            link: function (scope, element, attrs) {
                var firstLoading=true;
                scope.$watch(function () {
                    return element.height();
                }, function (newValue, oldValue) {
                    if (firstLoading&&newValue) {
                        firstLoading=false;
                        element.flex({
                            limitHeight: attrs.limitHeight
                        });
                    }
                });
            }
        }
    }]);






/**
 * Created by SNAKE on 2017/3/1.
 */
angular.module("dp.ui.input",[])
    .directive("dpInputSearch", [function(){
        function link(scope, element, attrs) {
            scope.searchItem = function(event){
                if (event.keyCode == 13) {
                    scope.action();
                }
            };
            scope.cancel = function(){
                scope.keyword = "";
            };
        }

        function controller($scope, $element, $attrs) {

        }

        return {
            restrict: "EA",
            template:'<div class="input-group input-group-sm input-search" style="line-height:20px;">' +
            '<input type="text" class="form-control" placeholder="{{placeholder}}" ng-model="keyword" ng-keyup="searchItem($event)"> ' +
            '<span class="ng-hide" ng-show="keyword.length>0" ng-click="cancel()"' +
            'style="position: absolute;margin-left: -16px;z-index: 2;font-size: 10px;margin-top: 6px;color: #ddd;"> ' +
            '<i class="glyphicon glyphicon-remove"></i> ' +
            '</span> ' +
            '<span class="input-group-btn"> ' +
            '<button class="btn btn-default" type="button" ng-click="action()">搜索</button> ' +
            '</span> ' +
            '</div>',
            scope: {
                action: "&",
                placeholder: "=",
                keyword: "=dpInput"
            },
            link: link,
            controller: controller
        }
    }]);

/**
 * Bootstro.js Simple way to show your user around, especially first time users 
 * Http://github.com/clu3/bootstro.js
 * 
 * Credit thanks to 
 * Revealing Module Pattern from 
 * http://enterprisejquery.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
 * 
 * Bootstrap popover variable width
 * http://stackoverflow.com/questions/10028218/twitter-bootstrap-popovers-multiple-widths-and-other-css-properties
 * 
 */

$(document).ready(function() {
    //Self-Executing Anonymous Func: Part 2 (Public & Private)
    (function(bootstro, $, undefined) {
        var $elements; //jquery elements to be highlighted
        var count;
        var popovers = []; //contains array of the popovers data
        var activeIndex = null; //index of active item
        var bootstrapVersion = 3;

        var defaults = {
            nextButtonText: 'Next &raquo;', //will be wrapped with button as below
            //nextButton : '<button class="btn btn-primary btn-xs bootstro-next-btn">Next &raquo;</button>',
            prevButtonText: '&laquo; Prev',
            //prevButton : '<button class="btn btn-primary btn-xs bootstro-prev-btn">&laquo; Prev</button>',
            finishButtonText: '<i class="icon-ok"></i> Ok I got it, get back to the site',
            //finishButton : '<button class="btn btn-xs btn-success bootstro-finish-btn"><i class="icon-ok"></i> Ok I got it, get back to the site</button>',
            stopOnBackdropClick: true,
            stopOnEsc: true,

            //onComplete : function(params){} //params = {idx : activeIndex}
            //onExit : function(params){} //params = {idx : activeIndex}
            //onStep : function(params){} //params = {idx : activeIndex, direction : [next|prev]}
            //url : String // ajaxed url to get show data from

            margin: 100, //if the currently shown element's margin is less than this value
            // the element should be scrolled so that i can be viewed properly. This is useful 
            // for sites which have fixed top/bottom nav bar
        };
        var settings;


        //===================PRIVATE METHODS======================
        //http://stackoverflow.com/questions/487073/check-if-element-is-visible-after-scrolling
        function is_entirely_visible($elem) {
            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + $(window).height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom) && (elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        }

        //add the nav buttons to the popover content;

        function add_nav_btn(content, i) {
            var $el = get_element(i);
            var nextButton, prevButton, finishButton, defaultBtnClass;
            if (bootstrapVersion == 2)
                defaultBtnClass = "btn btn-primary btn-mini";
            else
                defaultBtnClass = "btn btn-primary btn-xs"; //default bootstrap version 3
            content = content + "<div class='bootstro-nav-wrapper'>";
            if ($el.attr('data-bootstro-nextButton')) {
                nextButton = $el.attr('data-bootstro-nextButton');
            } else if ($el.attr('data-bootstro-nextButtonText')) {
                nextButton = '<button class="' + defaultBtnClass + ' bootstro-next-btn">' + $el.attr('data-bootstro-nextButtonText') + '</button>';
            } else {
                if (typeof settings.nextButton != 'undefined' /*&& settings.nextButton != ''*/ )
                    nextButton = settings.nextButton;
                else
                    nextButton = '<button class="' + defaultBtnClass + ' bootstro-next-btn">' + settings.nextButtonText + '</button>';
            }

            if ($el.attr('data-bootstro-prevButton')) {
                prevButton = $el.attr('data-bootstro-prevButton');
            } else if ($el.attr('data-bootstro-prevButtonText')) {
                prevButton = '<button class="' + defaultBtnClass + ' bootstro-prev-btn">' + $el.attr('data-bootstro-prevButtonText') + '</button>';
            } else {
                if (typeof settings.prevButton != 'undefined' /*&& settings.prevButton != ''*/ )
                    prevButton = settings.prevButton;
                else
                    prevButton = '<button class="' + defaultBtnClass + ' bootstro-prev-btn">' + settings.prevButtonText + '</button>';
            }

            if ($el.attr('data-bootstro-finishButton')) {
                finishButton = $el.attr('data-bootstro-finishButton');
            } else if ($el.attr('data-bootstro-finishButtonText')) {
                finishButton = '<button class="' + defaultBtnClass + ' bootstro-finish-btn">' + $el.attr('data-bootstro-finishButtonText') + '</button>';
            } else {
                if (typeof settings.finishButton != 'undefined' /*&& settings.finishButton != ''*/ )
                    finishButton = settings.finishButton;
                else
                    finishButton = '<button class="' + defaultBtnClass + ' bootstro-finish-btn">' + settings.finishButtonText + '</button>';
            }


            if (count != 1) {
                if (i == 0)
                    content = content + nextButton;
                else if (i == count - 1)
                    content = content + prevButton;
                else
                    content = content + nextButton + prevButton
            }
            content = content + '</div>';

            content = content + '<div class="bootstro-finish-btn-wrapper">' + finishButton + '</div>';
            return content;
        }

        //prep objects from json and return selector
        process_items = function(popover) {
            var selectorArr = [];
            $.each(popover, function(t, e) {
                //only deal with the visible element
                //build the selector
                $.each(e, function(j, attr) {
                    $(e.selector).attr('data-bootstro-' + j, attr);
                });
                if ($(e.selector).is(":visible"))
                    selectorArr.push(e.selector);
            });
            return selectorArr.join(",");
        }

        //get the element to intro at stack i 
        get_element = function(i) {
            //get the element with data-bootstro-step=i 
            //or otherwise the the natural order of the set
            if ($elements.filter("[data-bootstro-step=" + i + "]").size() > 0)
                return $elements.filter("[data-bootstro-step=" + i + "]");
            else {
                return $elements.eq(i);
                /*
                nrOfElementsWithStep = 0;
                $elements.filter("[data-bootstro-step!='']").each(function(j,e){
                    nrOfElementsWithStep ++;
                    if (j > i)
                        return $elements.filter(":not([data-bootstro-step])").eq(i - nrOfElementsWithStep);
                })
                */
            }
        }

        get_popup = function(i) {
            var p = {};
            var $el = get_element(i);
            //p.selector = selector;
            var t = '';
            if (count > 1) {
                t = "<span class='label label-success'>" + (i + 1) + "/" + count + "</span>";
            }
            p.title = $el.attr('data-bootstro-title') || '';
            if (p.title != '' && t != '')
                p.title = t + ' - ' + p.title;
            else if (p.title == '')
                p.title = t;

            p.content = $el.attr('data-bootstro-content') || '';
            p.content = add_nav_btn(p.content, i);
            p.placement = $el.attr('data-bootstro-placement') || 'top';
            var style = '';
            if ($el.attr('data-bootstro-width')) {
                p.width = $el.attr('data-bootstro-width');
                style = style + 'width:' + $el.attr('data-bootstro-width') + ';'
            }
            if ($el.attr('data-bootstro-height')) {
                p.height = $el.attr('data-bootstro-height');
                style = style + 'height:' + $el.attr('data-bootstro-height') + ';'
            }
            p.trigger = 'manual'; //always set to manual.

            p.html = $el.attr('data-bootstro-html') || 'top';
            if ($el.attr('data-bootstro-container')) {
                p.container = $el.attr('data-bootstro-container');
            }

            //resize popover if it's explicitly specified
            //note: this is ugly. Could have been best if popover supports width & height
            p.template = '<div class="popover bootstro-popover" style="' + style + '"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div>' +
                '</div>';

            return p;

        }

        //===================PUBLIC METHODS======================
        //destroy popover at stack index i
        bootstro.destroy_popover = function(i) {
            var i = i || 0;
            if (i != 'all') {
                var $el = get_element(i); //$elements.eq(i); 
                $el.popover('destroy').removeClass('bootstro-highlight');
            }
            /*
            else //destroy all
            {
                $elements.each(function(e){
                    
                    $(e).popover('destroy').removeClass('bootstro-highlight');
                });
            }
            */
        };

        //destroy active popover and remove backdrop
        bootstro.stop = function() {
            bootstro.destroy_popover(activeIndex);
            bootstro.unbind();
            $("div.bootstro-backdrop").remove();
            if (typeof settings.onExit == 'function')
                settings.onExit.call(this, {
                    idx: activeIndex
                });
        };

        //go to the popover number idx starting from 0
        bootstro.go_to = function(idx) {
            //destroy current popover if any
            bootstro.destroy_popover(activeIndex);
            if (count != 0) {
                var p = get_popup(idx);
                var $el = get_element(idx);

                $el.popover(p).popover('show');

                //scroll if neccessary
                var docviewTop = $(window).scrollTop();
                var top = Math.min($(".popover.in").offset().top, $el.offset().top);

                //distance between docviewTop & min.
                var topDistance = top - docviewTop;

                if (topDistance < settings.margin) //the element too up above
                    $('html,body').animate({
                        scrollTop: top - settings.margin
                    },
                    'slow');
                else if (!is_entirely_visible($(".popover.in")) || !is_entirely_visible($el))
                //the element is too down below
                    $('html,body').animate({
                        scrollTop: top - settings.margin
                    },
                    'slow');
                // html 

                $el.addClass('bootstro-highlight');
                activeIndex = idx;
            }
        };

        bootstro.next = function() {
            if (activeIndex + 1 == count) {
                if (typeof settings.onComplete == 'function')
                    settings.onComplete.call(this, {
                        idx: activeIndex
                    }); //
            } else {
                bootstro.go_to(activeIndex + 1);
                if (typeof settings.onStep == 'function')
                    settings.onStep.call(this, {
                        idx: activeIndex,
                        direction: 'next'
                    }); //
            }
        };

        bootstro.prev = function() {
            if (activeIndex == 0) {
                /*
                if (typeof settings.onRewind == 'function')
                    settings.onRewind.call(this, {idx : activeIndex, direction : 'prev'});//
                */
            } else {
                bootstro.go_to(activeIndex - 1);
                if (typeof settings.onStep == 'function')
                    settings.onStep.call(this, {
                        idx: activeIndex,
                        direction: 'prev'
                    }); //
            }
        };

        bootstro._start = function(selector) {
            selector = selector || '.bootstro';

            $elements = $(selector);
            count = $elements.size();
            if (count > 0 && $('div.bootstro-backdrop').length === 0) {
                // Prevents multiple copies
                $('<div class="bootstro-backdrop"></div>').appendTo('body');
                bootstro.bind();
                bootstro.go_to(0);
            }
        };

        bootstro.start = function(selector, options) {
            settings = $.extend(true, {}, defaults); //deep copy
            $.extend(settings, options || {});
            //if options specifies a URL, get the intro configuration from URL via ajax
            if (typeof settings.url != 'undefined') {
                //get config from ajax
                $.ajax({
                    url: settings.url,
                    success: function(data) {
                        if (data.success) {
                            //result is an array of {selector:'','title':'','width', ...}
                            var popover = data.result;
                            //console.log(popover);
                            selector = process_items(popover);
                            bootstro._start(selector);
                        }
                    }
                });
            }
            //if options specifies an items object use it to load the intro configuration
            //settings.items is an array of {selector:'','title':'','width', ...}
            else if (typeof settings.items != 'undefined') {
                bootstro._start(process_items(settings.items))
            } else {
                bootstro._start(selector);
            }
        };

        bootstro.set_bootstrap_version = function(ver) {
            bootstrapVersion = ver;
        }

        //bind the nav buttons click event
        bootstro.bind = function() {
            bootstro.unbind();

            $("html").on('click.bootstro', ".bootstro-next-btn", function(e) {
                bootstro.next();
                e.preventDefault();
                return false;
            });

            $("html").on('click.bootstro', ".bootstro-prev-btn", function(e) {
                bootstro.prev();
                e.preventDefault();
                return false;
            });

            //end of show
            $("html").on('click.bootstro', ".bootstro-finish-btn", function(e) {
                e.preventDefault();
                bootstro.stop();
            });

            if (settings.stopOnBackdropClick) {
                $("html").on('click.bootstro', 'div.bootstro-backdrop', function(e) {
                    if ($(e.target).hasClass('bootstro-backdrop'))
                        bootstro.stop();
                });
            }

            //bind the key event
            $(document).on('keydown.bootstro', function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code == 39 || code == 40)
                    bootstro.next();
                else if (code == 37 || code == 38)
                    bootstro.prev();
                else if (code == 27 && settings.stopOnEsc)
                    bootstro.stop();
            })
        };

        bootstro.unbind = function() {
            $("html").unbind('click.bootstro');
            $(document).unbind('keydown.bootstro');
        }

    }(window.bootstro = window.bootstro || {}, jQuery));


    (function($) {
        $.intro = function(bss, options) {
            if (bss && bss.length > 0) {
                for (var i = 0; i < bss.length; i++) {
                    $.intro.init(bss[i][0], bss[i][1], i);
                }

                var opt = $.extend({}, $.intro.bstroopts,options);
                bootstro.start('.bootstro', opt);
            }
        };

        $.intro.bstrooptions = {
            width: '400px',
            html: 'true',
            nbtext: '下一步',
            place: 'bottom',
            title: '提示',
            content: ''
        };

        $.intro.bstroopts = {
            prevButtonText: '上一步',
            finishButton: '<button class="btn btn-lg btn-success bootstro-finish-btn"><i class="icon-ok"></i>完成</button>',
            stopOnBackdropClick: false,
            stopOnEsc: false
        };

        $.intro.init = function(selector, options, step) {
            if (selector) {
                var $element = $(selector);
                if ($element.length > 0) {
                    var opt = $.extend({}, $.intro.bstrooptions, options);
                    if (typeof options == 'string') {
                        opt.content = options;
                    } else {
                        $.extend(opt, options);
                    }

                    $element.each(function() {
                        $(this).attr({
                            'data-bootstro-width': opt.width,
                            'data-bootstro-title': opt.title,
                            'data-bootstro-html': opt.html,
                            'data-bootstro-content': opt.content,
                            'data-bootstro-placement': opt.place,
                            'data-bootstro-nextButtonText': opt.nbtext,
                            'data-bootstro-step': step
                        }).addClass('bootstro');
                    });
                }
            }
        };

    })(jQuery)
});
angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition'])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
    .factory('$$stackedMap', function () {
        return {
            createNew: function () {
                var stack = [];

                return {
                    add: function (key, value) {
                        stack.push({
                            key: key,
                            value: value
                        });
                    },
                    get: function (key) {
                        for (var i = 0; i < stack.length; i++) {
                            if (key == stack[i].key) {
                                return stack[i];
                            }
                        }
                    },
                    keys: function () {
                        var keys = [];
                        for (var i = 0; i < stack.length; i++) {
                            keys.push(stack[i].key);
                        }
                        return keys;
                    },
                    top: function () {
                        return stack[stack.length - 1];
                    },
                    remove: function (key) {
                        var idx = -1;
                        for (var i = 0; i < stack.length; i++) {
                            if (key == stack[i].key) {
                                idx = i;
                                break;
                            }
                        }
                        return stack.splice(idx, 1)[0];
                    },
                    removeTop: function () {
                        return stack.splice(stack.length - 1, 1)[0];
                    },
                    length: function () {
                        return stack.length;
                    }
                };
            }
        };
    })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
    .directive('modalBackdrop', ['$timeout', function ($timeout) {
        return {
            restrict: 'EA',
            //replace: true,
            templateUrl: COMMON_SOURCE_PATH + 'views/modal/backdrop.html',
            link: function (scope, element, attrs) {
                scope.backdropClass = attrs.backdropClass || '';

                scope.animate = false;

                //trigger CSS transitions
                $timeout(function () {
                    scope.animate = true;
                });
            }
        };
    }])

    .directive('modalWindow', ['$modalStack', '$timeout', function ($modalStack, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                index: '@',
                animate: '='
            },
            //replace: true,
            transclude: true,
            templateUrl: function (tElement, tAttrs) {
                return tAttrs.templateUrl || COMMON_SOURCE_PATH + 'views/modal/window.html';
            },
            link: function (scope, element, attrs) {
                element.addClass(attrs.windowClass || '');
                scope.size = attrs.size;

                $timeout(function () {
                    // trigger CSS transitions
                    scope.animate = true;

                    /**
                     * Auto-focusing of a freshly-opened modal element causes any child elements
                     * with the autofocus attribute to lose focus. This is an issue on touch
                     * based devices which will show and then hide the onscreen keyboard.
                     * Attempts to refocus the autofocus element via JavaScript will not reopen
                     * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
                     * the modal element if the modal does not contain an autofocus element.
                     */
                    if (!element[0].querySelectorAll('[autofocus]').length) {
                        element[0].focus();
                    }
                });

                scope.close = function (evt) {
                    var modal = $modalStack.getTop();
                    if (modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        $modalStack.dismiss(modal.key, 'backdrop click');
                    }
                };
            }
        };
    }])

    .directive('modalTransclude', function () {
        return {
            link: function ($scope, $element, $attrs, controller, $transclude) {
                $transclude($scope.$parent, function (clone) {
                    $element.empty();
                    $element.append(clone);
                });
            }
        };
    })

    .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
        function ($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {

            var OPENED_MODAL_CLASS = 'modal-open';

            var backdropDomEl, backdropScope;
            var openedWindows = $$stackedMap.createNew();
            var $modalStack = {};

            function backdropIndex() {
                var topBackdropIndex = -1;
                var opened = openedWindows.keys();
                for (var i = 0; i < opened.length; i++) {
                    if (openedWindows.get(opened[i]).value.backdrop) {
                        topBackdropIndex = i;
                    }
                }
                return topBackdropIndex;
            }

            $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
                if (backdropScope) {
                    backdropScope.index = newBackdropIndex;
                }
            });

            function removeModalWindow(modalInstance) {

                var body = $document.find('body').eq(0);
                var modalWindow = openedWindows.get(modalInstance).value;

                //clean up the stack
                openedWindows.remove(modalInstance);

                //remove window DOM element
                removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function () {
                    modalWindow.modalScope.$destroy();
                    body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
                    checkRemoveBackdrop();
                });
            }

            function checkRemoveBackdrop() {
                //remove backdrop if no longer needed
                if (backdropDomEl && backdropIndex() == -1) {
                    var backdropScopeRef = backdropScope;
                    removeAfterAnimate(backdropDomEl, backdropScope, 150, function () {
                        backdropScopeRef.$destroy();
                        backdropScopeRef = null;
                    });
                    backdropDomEl = undefined;
                    backdropScope = undefined;
                }
            }

            function removeAfterAnimate(domEl, scope, emulateTime, done) {
                // Closing animation
                scope.animate = false;

                var transitionEndEventName = $transition.transitionEndEventName;
                if (transitionEndEventName) {
                    // transition out
                    var timeout = $timeout(afterAnimating, emulateTime);

                    domEl.bind(transitionEndEventName, function () {
                        $timeout.cancel(timeout);
                        afterAnimating();
                        scope.$apply();
                    });
                } else {
                    // Ensure this call is async
                    $timeout(afterAnimating);
                }

                function afterAnimating() {
                    if (afterAnimating.done) {
                        return;
                    }
                    afterAnimating.done = true;

                    domEl.remove();
                    if (done) {
                        done();
                    }
                }
            }

            $document.bind('keydown', function (evt) {
                var modal;

                if (evt.which === 27) {
                    modal = openedWindows.top();
                    if (modal && modal.value.keyboard) {
                        evt.preventDefault();
                        $rootScope.$apply(function () {
                            $modalStack.dismiss(modal.key, 'escape key press');
                        });
                    }
                }
            });

            $modalStack.open = function (modalInstance, modal) {

                openedWindows.add(modalInstance, {
                    deferred: modal.deferred,
                    modalScope: modal.scope,
                    backdrop: modal.backdrop,
                    keyboard: modal.keyboard
                });

                var body = $document.find('body').eq(0),
                    currBackdropIndex = backdropIndex();

                if (currBackdropIndex >= 0 && !backdropDomEl) {
                    backdropScope = $rootScope.$new(true);
                    backdropScope.index = currBackdropIndex;
                    var angularBackgroundDomEl = angular.element('<div modal-backdrop></div>');
                    angularBackgroundDomEl.attr('backdrop-class', modal.backdropClass);
                    backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope);
                    body.append(backdropDomEl);
                }

                var angularDomEl = angular.element('<div modal-window></div>');
                angularDomEl.attr({
                    'template-url': modal.windowTemplateUrl,
                    'window-class': modal.windowClass,
                    'size': modal.size,
                    'index': openedWindows.length() - 1,
                    'animate': 'animate'
                }).html(modal.content);

                var modalDomEl = $compile(angularDomEl)(modal.scope);
                openedWindows.top().value.modalDomEl = modalDomEl;
                body.append(modalDomEl);
                body.addClass(OPENED_MODAL_CLASS);
            };

            $modalStack.close = function (modalInstance, result) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow) {
                    modalWindow.value.deferred.resolve(result);
                    removeModalWindow(modalInstance);
                }
            };

            $modalStack.dismiss = function (modalInstance, reason) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow) {
                    modalWindow.value.deferred.reject(reason);
                    removeModalWindow(modalInstance);
                }
            };

            $modalStack.dismissAll = function (reason) {
                var topModal = this.getTop();
                while (topModal) {
                    this.dismiss(topModal.key, reason);
                    topModal = this.getTop();
                }
            };

            $modalStack.getTop = function () {
                return openedWindows.top();
            };

            return $modalStack;
        }
    ])

    .provider('$modal', function () {
        var $modalProvider = {
            options: {
                backdrop: "static", //can be also false or 'static'
                keyboard: true
            },
            $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
                function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

                    var $modal = {};

                    function getTemplatePromise(options) {
                        return options.template ? $q.when(options.template) :
                            $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl, {
                                cache: $templateCache
                            }).then(function (result) {
                                return result.data;
                            });
                    }

                    function getResolvePromises(resolves) {
                        var promisesArr = [];
                        angular.forEach(resolves, function (value) {
                            if (angular.isFunction(value) || angular.isArray(value)) {
                                promisesArr.push($q.when($injector.invoke(value)));
                            }
                        });
                        return promisesArr;
                    }

                    $modal.open = function (modalOptions) {

                        var modalResultDeferred = $q.defer();
                        var modalOpenedDeferred = $q.defer();

                        //prepare an instance of a modal to be injected into controllers and returned to a caller
                        var modalInstance = {
                            result: modalResultDeferred.promise,
                            opened: modalOpenedDeferred.promise,
                            close: function (result) {
                                $modalStack.close(modalInstance, result);
                            },
                            dismiss: function (reason) {
                                $modalStack.dismiss(modalInstance, reason);
                            }
                        };

                        //merge and clean up options
                        modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                        modalOptions.resolve = modalOptions.resolve || {};

                        //verify options
                        if (!modalOptions.template && !modalOptions.templateUrl) {
                            throw new Error('One of template or templateUrl options is required.');
                        }

                        var templateAndResolvePromise =
                            $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


                        templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

                            var modalScope = (modalOptions.scope || $rootScope).$new();
                            modalScope.$close = modalInstance.close;
                            modalScope.$dismiss = modalInstance.dismiss;

                            var ctrlInstance, ctrlLocals = {};
                            var resolveIter = 1;

                            //controllers
                            if (modalOptions.controller) {
                                ctrlLocals.$scope = modalScope;
                                ctrlLocals.$modalInstance = modalInstance;
                                angular.forEach(modalOptions.resolve, function (value, key) {
                                    ctrlLocals[key] = tplAndVars[resolveIter++];
                                });
                                ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                                if (modalOptions.controllerAs) {
                                    modalScope[modalOptions.controllerAs] = ctrlInstance;
                                }
                            }

                            $modalStack.open(modalInstance, {
                                scope: modalScope,
                                deferred: modalResultDeferred,
                                content: tplAndVars[0],
                                backdrop: modalOptions.backdrop,
                                keyboard: modalOptions.keyboard,
                                backdropClass: modalOptions.backdropClass,
                                windowClass: modalOptions.windowClass,
                                windowTemplateUrl: modalOptions.windowTemplateUrl,
                                size: modalOptions.size
                            });

                        }, function resolveError(reason) {
                            modalResultDeferred.reject(reason);
                        });

                        templateAndResolvePromise.then(function () {
                            modalOpenedDeferred.resolve(true);
                        }, function () {
                            modalOpenedDeferred.reject(false);
                        });

                        return modalInstance;
                    };

                    return $modal;
                }
            ]
        };

        return $modalProvider;
    });



/**
 * @ngDoc directive
 * @name ng.directive:paging
 *
 * @description
 * A directive to aid in paging large datasets
 * while requiring a small amount of page
 * information.
 *
 * @element EA
 *
 */
angular.module("dp.ui.paging", [])
    .directive('paging', function () {

        /**
         * Assign default scope values from settings
         * Feel free to tweak / fork these for your application
         *
         * @param {Object} scope - The local directive scope object
         * @param {Object} attrs - The local directive attribute object
         */
        function setScopeValues(scope, attrs) {
            scope.List = [];
            scope.Hide = false;
            scope.dots = scope.dots || '...';
            scope.page = parseInt(scope.page) || 1;
            scope.total = parseInt(scope.total) || 0;
            scope.ulClass = scope.ulClass || 'pagination';
            scope.adjacent = parseInt(scope.adjacent) || 1;
            scope.activeClass = scope.activeClass || 'active';
            scope.disabledClass = scope.disabledClass || 'disabled';

            scope.scrollTop = scope.$eval(attrs.scrollTop);
            scope.hideIfEmpty = scope.$eval(attrs.hideIfEmpty)||true;
            scope.showPrevNext = scope.$eval(attrs.showPrevNext);
            //add by xj
            scope.pageSizeEnum = attrs.sizeConfig ? attrs.sizeConfig.split(",") : [5,10, 20, 50, 100,200];
        }

        /**
         * Validate and clean up any scope values
         * This happens after we have set the scope values
         *
         * @param {Object} scope - The local directive scope object
         * @param {int} pageCount - The last page number or total page count
         */
        function validateScopeValues(scope, pageCount) {

            // Block where the page is larger than the pageCount
            if (scope.page > pageCount) {
                scope.page = pageCount;
            }

            // Block where the page is less than 0
            if (scope.page <= 0) {
                scope.page = 1;
            }

            // Block where adjacent value is 0 or below
            if (scope.adjacent <= 0) {
                scope.adjacent = 2;
            }

            // Hide from page if we have 1 or less pages
            // if directed to hide empty
            if (pageCount < 1) {
                scope.Hide = scope.hideIfEmpty;
            }
        }

        /**
         * Assign the method action to take when a page is clicked
         *
         * @param {Object} scope - The local directive scope object
         * @param {int} page - The current page of interest
         */
        function internalAction(scope, page) {

            // Block clicks we try to load the active page
            if (scope.page == page) {
                return;
            }

            // Update the page in scope
            scope.page = page;

            // Pass our parameters to the paging action
            scope.pagingAction({
                page: scope.page,
                pageSize: scope.pageSize,
                total: scope.total
            });

            // If allowed scroll up to the top of the page
            if (scope.scrollTop) {
                scrollTo(0, 0);
            }
        }


        /**
         * Add the first, previous, next, and last buttons if desired
         * The logic is defined by the mode of interest
         * This method will simply return if the scope.showPrevNext is false
         * This method will simply return if there are no pages to display
         *
         * @param {Object} scope - The local directive scope object
         * @param {int} pageCount - The last page number or total page count
         * @param {string} mode - The mode of interest either prev or last
         */
        /* function addPrevNext(scope, pageCount, mode) {
         // Ignore if we are not showing
         // or there are no pages to display
         if (!scope.showPrevNext || pageCount < 1) {
         return;
         }

         // Local variables to help determine logic
         var disabled, alpha, beta;

         // Determine logic based on the mode of interest
         // Calculate the previous / next page and if the click actions are allowed
         if (mode === 'prev') {

         disabled = scope.page - 1 <= 0;
         var prevPage = scope.page - 1 <= 0 ? 1 : scope.page - 1;

         alpha = {value: "<<", title: '首页', page: 1};
         beta = {value: "<", title: '上一页', page: prevPage};
         } else {

         disabled = scope.page + 1 > pageCount;
         var nextPage = scope.page + 1 >= pageCount ? pageCount : scope.page + 1;

         alpha = {value: ">", title: '下一页', page: nextPage};
         beta = {value: ">>", title: '末页', page: pageCount};
         }

         // Build the first list item
         var alphaItem = {
         value: alpha.value,
         title: alpha.title,
         liClass: disabled ? scope.disabledClass : '',
         action: function () {
         if (!disabled) {
         internalAction(scope, alpha.page);
         }
         }
         };

         // Build the second list item
         var betaItem = {
         value: beta.value,
         title: beta.title,
         liClass: disabled ? scope.disabledClass : '',
         action: function () {
         if (!disabled) {
         internalAction(scope, beta.page);
         }
         }
         };

         // Add the items
         scope.List.push(alphaItem);
         scope.List.push(betaItem);
         }*/

        function addPrevNext(scope, pageCount, mode) {
            // Ignore if we are not showing
            // or there are no pages to display
            if (!scope.showPrevNext || pageCount < 1) {
                return;
            }

            // Local variables to help determine logic
            var disabled, alpha, beta;

            // Determine logic based on the mode of interest
            // Calculate the previous / next page and if the click actions are allowed
            if (mode === 'prev') {

                disabled = scope.page - 1 <= 0;
                var prevPage = scope.page - 1 <= 0 ? 1 : scope.page - 1;

                alpha = {value: "<", title: '上一页', page: prevPage};
            } else {

                disabled = scope.page + 1 > pageCount;
                var nextPage = scope.page + 1 >= pageCount ? pageCount : scope.page + 1;

                alpha = {value: ">", title: '下一页', page: nextPage};
            }

            // Build the first list item
            var alphaItem = {
                value: alpha.value,
                title: alpha.title,
                liClass: disabled ? scope.disabledClass : '',
                action: function () {
                    if (!disabled) {
                        internalAction(scope, alpha.page);
                    }
                }
            };

            /* // Build the second list item
             var betaItem = {
             value: beta.value,
             title: beta.title,
             liClass: disabled ? scope.disabledClass : '',
             action: function () {
             if (!disabled) {
             internalAction(scope, beta.page);
             }
             }
             };*/

            // Add the items
            scope.List.push(alphaItem);
        }

        /**
         * Adds a range of numbers to our list
         * The range is dependent on the start and finish parameters
         *
         * @param {int} start - The start of the range to add to the paging list
         * @param {int} finish - The end of the range to add to the paging list
         * @param {Object} scope - The local directive scope object
         */
        function addRange(start, finish, scope) {

            var i = 0;
            for (i = start; i <= finish; i++) {
                var item = {
                    value: i,
                    title: '第 ' + i + ' 页',
                    liClass: scope.page == i ? scope.activeClass : '',
                    action: function () {
                        internalAction(scope, this.value);
                    }
                };

                scope.List.push(item);
            }
        }


        /**
         * Add Dots ie: 1 2 [...] 10 11 12 [...] 56 57
         * This is my favorite function not going to lie
         *
         * @param {Object} scope - The local directive scope object
         */
        function addDots(scope) {
            scope.List.push({
                value: scope.dots
            });
        }


        /**
         * Add the first or beginning items in our paging list
         * We leverage the 'next' parameter to determine if the dots are required
         *
         * @param {Object} scope - The local directive scope object
         * @param {int} next - the next page number in the paging sequence
         */
        function addFirst(scope, next) {

            addRange(1, 2, scope);

            // We ignore dots if the next value is 3
            // ie: 1 2 [...] 3 4 5 becomes just 1 2 3 4 5
            if (next != 3) {
                addDots(scope);
            }
        }

        /**
         * Add the last or end items in our paging list
         * We leverage the 'prev' parameter to determine if the dots are required
         *
         * @param {int} pageCount - The last page number or total page count
         * @param {Object} scope - The local directive scope object
         * @param {int} prev - the previous page number in the paging sequence
         */
        // Add Last Pages
        function addLast(pageCount, scope, prev) {

            // We ignore dots if the previous value is one less that our start range
            // ie: 1 2 3 4 [...] 5 6  becomes just 1 2 3 4 5 6
            if (prev != pageCount - 2) {
                addDots(scope);
            }

            addRange(pageCount - 1, pageCount, scope);
        }


        /**
         * The main build function used to determine the paging logic
         * Feel free to tweak / fork values for your application
         *
         * @param {Object} scope - The local directive scope object
         * @param {Object} attrs - The local directive attribute object
         */
        function build(scope, attrs) {

            // Block divide by 0 and empty page size
            if (!scope.pageSize || scope.pageSize <= 0) {
                scope.pageSize = 1;
            }
            // Determine the last page or total page count
            var pageCount = scope.pageCount = Math.ceil(scope.total / scope.pageSize);
            // Set the default scope values where needed
            setScopeValues(scope, attrs);
            // Validate the scope values to protect against strange states
            validateScopeValues(scope, pageCount);
            // Create the beginning and end page values
            var start, finish;
            // Calculate the full adjacency value
            var fullAdjacentSize = (scope.adjacent * 2) + 2;
            // Add the Next and Previous buttons to our list
            addPrevNext(scope, pageCount, 'prev');
            // If the page count is less than the full adjacnet size
            // Then we simply display all the pages, Otherwise we calculate the proper paging display
            if (pageCount <= (fullAdjacentSize + 2)) {
                start = 1;
                addRange(start, pageCount, scope);
            } else {
                // Determine if we are showing the beginning of the paging list
                // We know it is the beginning if the page - adjacent is <= 2
                if (scope.page - scope.adjacent <= 2) {
                    start = 1;
                    finish = 1 + fullAdjacentSize;

                    addRange(start, finish, scope);
                    addLast(pageCount, scope, finish);
                }
                // Determine if we are showing the middle of the paging list
                // We know we are either in the middle or at the end since the beginning is ruled out above
                // So we simply check if we are not at the end
                // Again 2 is hard coded as we always display two pages after the dots
                else if (scope.page < pageCount - (scope.adjacent + 2)) {
                    start = scope.page - scope.adjacent;
                    finish = scope.page + scope.adjacent;
                    addFirst(scope, start);
                    addRange(start, finish, scope);
                    addLast(pageCount, scope, finish);
                }
                // If nothing else we conclude we are at the end of the paging list
                // We know this since we have already ruled out the beginning and middle above
                else {
                    start = pageCount - fullAdjacentSize;
                    finish = pageCount;
                    addFirst(scope, start);
                    addRange(start, finish, scope);
                }
            }

            // Add the next and last buttons to our paging list
            addPrevNext(scope, pageCount, 'next');
        }


        /**
         * The angular return value required for the directive
         * Feel free to tweak / fork values for your application
         */
        return {
            // Restrict to elements and attributes
            restrict: 'EA',
            // Assign the angular scope attribute formatting
            scope: {
                page: '=',
                pageSize: '=',
                total: '=',
                dots: '@',
                hideIfEmpty: '@',
                ulClass: '@',
                activeClass: '@',
                disabledClass: '@',
                adjacent: '@',
                scrollTop: '@',
                showPrevNext: '@',
                pagingAction: '&',
                sizeConfig: "@"
            },
            // Assign the angular directive template HTML
            templateUrl: function($element,$attrs){
                return COMMON_SOURCE_PATH + ($attrs.templateUrl||"views/paging/paging.html")
            },
            // Link the directive to enable our scope watch values
            link: function (scope, element, attrs) {
                scope.goto = function () {
                    var pageNo = Number(scope.targetPageNo),
                        pageCount = Math.ceil(Number(scope.total) / Number(scope.pageSize));
                    if (!angular.isNumber(pageNo)) {
                        return
                    } else if (pageNo > pageCount) {
                        alert("超过最大页数");
                        return;
                    }

                    scope.pagingAction({
                        page: pageNo,
                        pageSize: scope.pageSize,
                        total: scope.total
                    });
                };

                scope.sizeChanged = function () {
                    scope.pagingAction({
                        page: scope.pageNo,
                        pageSize: scope.pageSize,
                        total: scope.total
                    });
                };

                // Hook in our watched items
                scope.$watchCollection('[page,pageSize,total]', function () {
                    build(scope, attrs);
                });
            }
        };
    });

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html popovers, and selector delegatation.
 */
angular.module( 'ui.bootstrap.popover', [ 'ui.bootstrap.tooltip' ] )

.directive( 'popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: COMMON_SOURCE_PATH+'views/popover/popover.html'
  };
})

.directive( 'popover', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'popover', 'popover', 'click' );
}]);


angular.module('dp.ui.pop', ["ui.bootstrap.transition"])
    .directive("dpPop", ["$timeout", function ($timeout) {
        return {
            restrict: "EA",
            scope: {
                animate: "=",
                type: "@"
            },
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || COMMON_SOURCE_PATH+"views/pop.html";
            },
            replace: true,
            transclude: true,
            link: function (scope, element, attrs, ctrl) {
                $timeout(function () {
                    scope.animate = true;
                });
            }
        }
    }])
    .directive("popTransclude", [function () {
        return {
            link: function ($scope, $element, $attrs, controller, $transclude) {
                $transclude($scope.$parent, function (clone) {
                    $element.empty();
                    $element.append(clone);
                });
            }
        }
    }])
    .factory("$pop", ["$compile", "$rootScope", "$document", "$q", "$http", "$templateCache", "$injector", "$controller", "$transition", "$timeout",
        function ($compile, $rootScope, $document, $q, $http, $templateCache, $injector, $controller, $transition, $timeout) {
            var DEFAULTS = {
                resolve: {},
                type: "pop-help"
            };
            var $pop = {};
            var $body = $document.find('body').eq(0);

            $pop.open = function (options) {
                var resultDeferred = $q.defer();
                var openedDeferred = $q.defer();

                var pop = {};
                var popInstance = {};

                popInstance = {
                    result: resultDeferred.promise,
                    close: function (result) {
                        resultDeferred.resolve(result);
                        removePopWindow();
                    }
                };

                options = angular.extend({}, DEFAULTS, options);

                if (!options.template && !options.templateUrl) {
                    throw new Error('One of template or templateUrl options is required.');
                }

                //获取模板和依赖
                var templateAndResolvePromise = $q.all([getTemplatePromise(options)].concat(getResolvePromises(options.resolve)));
                templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {
                    var popScope = (options.scope || $rootScope).$new();
                    popScope.$close = popInstance.close;
                    popScope.$dismiss = popInstance.dismiss;

                    var ctrlInstance, ctrlLocals = {};
                    var resolveIter = 1;

                    //controllers
                    if (options.controller) {
                        ctrlLocals.$scope = popScope;
                        ctrlLocals.$popInstance = popInstance;
                        angular.forEach(options.resolve, function (value, key) {
                            ctrlLocals[key] = tplAndVars[resolveIter++];
                        });
                        ctrlInstance = $controller(options.controller, ctrlLocals);
                        if (options.controllerAs) {
                            popScope[options.controllerAs] = ctrlInstance;
                        }
                    }
                    //create element
                    var angularElem = angular.element('<div dp-pop></div>');
                    angularElem.attr({
                        'animate': 'animate',
                        'type': options.type
                    }).html(tplAndVars[0]);
                    //记录scope
                    pop.popScope = popScope;
                    var popDomEl = $compile(angularElem)(popScope);
                    //记录DomEl
                    pop.popDomEl = popDomEl;
                    $body.append(angularElem);

                }, function resolveError(reason) {
                    resultDeferred.reject(reason);
                });

                templateAndResolvePromise.then(function () {
                    openedDeferred.resolve(true);
                }, function () {
                    openedDeferred.reject(false);
                });

                return popInstance;

                function removePopWindow() {
                    removeAfterAnimate(pop.popDomEl, pop.popScope, 300, function () {
                        pop.popScope.$destroy();
                    });
                }

                function removeAfterAnimate(domEl, scope, emulateTime, done) {
                    // Closing animation
                    scope.animate = false;

                    var transitionEndEventName = $transition.transitionEndEventName;
                    if (transitionEndEventName) {
                        // transition out
                        var timeout = $timeout(afterAnimating, emulateTime);

                        domEl.bind(transitionEndEventName, function () {
                            $timeout.cancel(timeout);
                            afterAnimating();
                            scope.$apply();
                        });
                    } else {
                        // Ensure this call is async
                        $timeout(afterAnimating);
                    }

                    function afterAnimating() {
                        if (afterAnimating.done) {
                            return;
                        }
                        afterAnimating.done = true;

                        domEl.remove();
                        if (done) {
                            done();
                        }
                    }
                }
            };

            function getTemplatePromise(options) {
                return options.template ? $q.when(options.template) :
                    $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl, {
                        cache: $templateCache
                    }).then(function (result) {
                        return result.data;
                    });
            }

            function getResolvePromises(resolves) {
                var promisesArr = [];
                angular.forEach(resolves, function (value) {
                    if (angular.isFunction(value) || angular.isArray(value)) {
                        promisesArr.push($q.when($injector.invoke(value)));
                    }
                });
                return promisesArr;
            }

            return $pop;
        }]);


angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function () {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function () {
            return hostElPos.left;
          },
          right: function () {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function () {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function () {
            return hostElPos.top;
          },
          bottom: function () {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }

        return targetElPos;
      }
    };
  }]);

angular.module("dp.ui.star", [])
    .directive("dpStar", [function () {
        var DEFAULTS = {
            maxScore: 10
        };

        function link(scope, element, attrs, ctrl) {
            var options = {
                maxScore: Number(attrs.maxScore),
                score: Number(attrs.score)
            };
            scope.options = $.extend({}, DEFAULTS, options);

            var percentage = (90 * scope.options.score / scope.options.maxScore).toFixed(2);
            scope.style = {
                width: percentage + "px"
            }
        }

        return {
            restrict: "EA",
            templateUrl: COMMON_SOURCE_PATH + "views/star/star.html",
            link: link,
            scope: {
                score: "@",
                maxScore: "@"
            },
            replace: true
        }
    }]);
//短信控件
angular.module("dp.ui.smsEditor", [])
    .directive("dpSmsBox", ["$location", "$sce", "$restClient", "$smsData", "$support", "$win", "$q", "$modal", "$interval", "$smsType", "$enum", "$compile", "$dpCookies",
        function($location, $sce, $restClient, $smsData, $support, $win, $q, $modal, $interval, $smsType, $enum, $compile, $dpCookies) {
            var DEFAULTS = {
                type: "", //短信类型
                customerDefinedType: "", //短信子类型
                signatureSource: $enum.getEnum("signature") || [], //签名列表,
                showBack: true, //显示回T退订
                showTmplOperation: true, //显示引用模板
                showUrlCreator: true, //显示生成短链接
                tmpVars: [], //临时变量
                vars: [], //系统变量
                showReceiverType: true, //显示接收人
                receiverTypeSource: "0,1,2", //接收人列表
                isJoin: true, //是否显示正式加入
                title: "短信设置", //编辑框标题
                staticMode: false, //是否可关闭
                btnOkName: "保存", //操作名称
                showBtnOk: true, //是否显示保存按钮
                showBtnNo: true //是否显示取消按钮
            };

            var controller = function($scope, $element, $attrs) {
                var ctrl = $scope.ctrl = this;
            };

            var link = function(scope, element, attrs, editCtrl) {
                var $viewer = element.find(".phone-content").eq(0); //短信预览框

                //设置预览
                scope.setPreView = function(content, sign) {
                    var html = content ? content : "";
                    var viewValue = $smsData.contentToPreview(content, sign);
                    !scope.options.showBack && (viewValue = viewValue + "回T退订");
                    $viewer.empty().html(viewValue);
                    scope.template.viewValue = viewValue;
                };

                //重置数据
                scope.resetData = function(entity) {
                    scope.template = angular.copy(entity || scope.entity); //模板
                    scope.setPreView($smsData.modelToContent(scope.template.content), scope.template.signatureId);
                };

                //外部变化时刷新控件
                scope.$watch('entity', function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        scope.resetData(newValue);
                    }
                }, true);

                scope.close = function() {
                    scope.opened = false;
                    scope.enabled = true;
                };

                scope.open = function() {
                    scope.opened = true;
                    scope.enabled = false;
                    scope.resetData(scope.entity);
                    initIntro();
                };

                scope.save = function() {
                    if (!$smsData.validate(scope.template)) {
                        return false
                    }
                    var postEntity = getPostData();

                    var promise = $q.when(postEntity, checkMsgLegal) //检查短信内容是否合法
                        .then(function() { //加入任务
                            return scope.saveAction({
                                result: postEntity,
                                instance: scope
                            })
                        }).then(function() { //任务成功
                            if (!scope.options.staticMode) {
                                scope.close();
                            }
                            //返回一个已解决的promise，为了结束loading
                            return $q.when();
                        }, function() { //任务失败

                            //返回一个已拒绝的promise，为了结束loading
                            return $q.reject();
                        });


                    //如果为静态模式，则不关闭窗口
                    if (!scope.options.staticMode) {
                        promise.then(function() {
                            scope.close();
                        });
                    }

                    scope.loading = promise;
                };

                scope.exit = function() {
                    scope.resetData(scope.entity);
                    scope.close();
                    if (scope.cancelAction) {
                        scope.cancelAction({
                            message: "关闭",
                            instance: scope
                        });
                    }
                };

                init();

                function initCtrl() {
                    scope.ctrl.getPostData = getPostData;
                    scope.ctrl.checkMsgLegal = checkMsgLegal;
                }

                function getPostData() {
                    var postEntity = angular.copy(scope.template);
                    //加入正式发送
                    if (postEntity.mobile) {
                        postEntity.mobile = postEntity.mobile.replace(/，/ig, ",");
                    }

                    return postEntity;
                }



                function init() {
                    //初始化控制器    
                    initCtrl();
                    scope.options = $.extend({}, DEFAULTS, scope.options);
                    scope.editorOptions = angular.copy(scope.options); //编辑器配置项
                    scope.receiverTypeSource = $smsData.getSmsReceiverType(scope.options.receiverTypeSource);
                    scope.sendTestTip = '由于运营商尽可能规避短信对客户带来的骚扰，因此相同手机号码10分钟内发送短信不可超过<span class="text-danger">3</span>条，测试时需要变换号码进行测试。若有疑问可随时与我们在线客服联系';
                    scope.enableSend = true;
                    scope.resetData(scope.entity);
                    initReceiverType(scope.receiverTypeSource);
                    if (scope.options.staticMode) {
                        initIntro();
                    }
                }

                function initReceiverType(source) {
                    var domStr = '<div dp-select-group ng-model="template.receiverType" type="multi" format="integer">';
                    $.each(source, function(i, item) {
                        var str = '<div dp-select value="{{key}}" text="{{value}}" disabled="{{disabled}}" tooltip="{{text}}"> </div>';
                        domStr += str.replace(/\{\{key\}\}/ig, item.key)
                            .replace(/\{\{value\}\}/ig, item.value)
                            .replace(/\{\{disabled\}\}/ig, item.disabled)
                            .replace(/\{\{text\}\}/ig, item.text);
                    });
                    domStr += "</div>";
                    var domElement = angular.element(domStr);
                    element.find(".receiver-type-source").append($compile(domElement)(scope));
                }

                //测试发送
                scope.sendTest = function(event) {
                    //验证短信内容
                    if (!$smsData.validate(scope.template)) {
                        return;
                    }
                    //验证测试号码
                    if (scope.template.mobile) {
                        var testNumber = scope.template.mobile.replace(/，/ig, ",").split(",");
                        if (testNumber.length > 5) {
                            $win.confirm({
                                title: '测试手机号错误提醒',
                                content: '测试短信手机号个数不能多于5个',
                                type: 'forbid',
                                showCancel: false,
                                closeText: "知道了",
                                size: "lg"
                            });
                            return;
                        }
                        for (var i = 0; i < testNumber.length; i++) {
                            if (!/^1[0-9]{10}$/.test(testNumber[i])) {
                                $win.confirm({
                                    title: '测试手机号错误提醒',
                                    content: testNumber[i] + '不是正确的手机号码，请修改后再保存',
                                    type: 'forbid',
                                    showCancel: false,
                                    closeText: "知道了",
                                    size: "lg"
                                });
                                return;
                            }
                        }
                    }
                    var action = {
                        successCallback: function(data) {
                            if (data.data) {
                                $win.alertSuccess("发送成功，请注意接收验证");
                                createTimer();
                            } else {
                                $win.alertSuccess("发送失败，请尝试重新发送");
                            }
                        },
                        failCallback: function(data) {
                            $smsData.dealFail(data);
                        }
                    };
                    var params = {
                        customerDefinedType: scope.options.customerDefinedType,
                        smsType: scope.options.type,
                        mobile: scope.template.mobile.replace(/，/ig, ","),
                        signatureId: scope.template.signatureId,
                        content: $smsData.filterTag($smsData.modelToPreview(scope.template.content))
                    };
                    $restClient.post("seller/sms/test", null, params, action);
                };

                //计时30秒
                function createTimer() {
                    scope.seconds = 30;
                    scope.enableSend = false;
                    scope.timer = $interval(function() {
                        if (scope.seconds > 0) {
                            scope.seconds--;
                        } else {
                            cancelTimer();
                        }
                    }, 1000);
                }

                //取消计时
                function cancelTimer() {
                    scope.enableSend = true;
                    scope.timer && $interval.cancel(scope.timer);
                    scope.timer = null;
                }

                function checkMsgLegal(postEntity) {
                    //return $q.all([checkUrl(), checkRemote()]); 
                    return $q.when(true);
                }

                /*function checkUrl() {
                    var deferred = $q.defer(),
                        promise = deferred.promise;

                    if ($smsData.hasUrl(scope.template.content)) {
                        var mes = {
                            img: "images/components/alert/alert-question.png",
                            title: "请确认短信中的链接前后是否有加空格？",
                            closeText: "继续保存",
                            cancelText: "返回修改",
                            content: '您短信中包含 <span class="text-danger">跳转链接</span>，请确保您的跳转链接前后都要加上 <span class="text-danger">空格</span>，否则有可能会导致链接无法打开！！！',
                            size: "lg"
                        };
                        $win.confirm(mes).result.then(function() {
                            deferred.resolve();
                        }, function() {
                            deferred.reject();
                        });
                    } else {
                        deferred.resolve();
                    }

                    return promise;
                }

                function checkRemote() {
                    var deferred = $q.defer(),
                        promise = deferred.promise;

                    var postData = {
                        content: scope.template.content,
                        informType: scope.options.type
                    };
                    var action = {
                        successCallback: function(data) {
                            deferred.resolve();
                        },
                        failCallback: function(data) {
                            $smsData.dealFail(data);
                            deferred.reject();
                        }
                    };
                    $restClient.post("seller/template/check", null, postData, action, deferred);

                    return promise;
                }*/

                function initIntro() {
                    var id = element.attr("id");

                    try {
                        var selector = "#" + id + " ";
                        var isbstro = $dpCookies.get('bootstro');
                        setTimeout(function() {
                            if (!isbstro) {
                                $.intro([
                                    [selector + '.param-list', '<h3 style="margin-top:10px;">可选变量~</h3>'],
                                    [selector + '.temp-select', '<h3 style="margin-top:10px;">在此进行模板操作~</h3>'],
                                    [selector + '.signature', '<h3 style="margin-top:10px;">变换签名~</h3>']
                                ], {
                                    obtn: '我已了解，下次不再提示！',
                                    onExit: function() {
                                        $dpCookies.set('bootstro', 'ok', moment().add(365, "days")._d.toGMTString(), "/");
                                    }
                                });
                            }
                        }, 1000);
                    } catch (e) {
                        console("smsBox:" + e);
                    }

                }
            };

            return {
                restrict: "A",
                templateUrl: COMMON_SOURCE_PATH + "views/smsBox/smsBox.html",
                controller: controller,
                scope: {
                    entity: "=",
                    opened: "=",
                    enabled: "=",
                    options: "=dpSmsBox",
                    saveAction: "&",
                    cancelAction: "&",
                    ctrl: "="
                },
                require: "?editSetting",
                link: link
            }
        }
    ]);

angular.module("dp.ui.smsEditor")
    .factory("$smsData", ["$enum", "$win", "$smsVarsConfig", function($enum, $win, $smsVarsConfig) {
        //短信对象配置
        var MSG_VAR_CONFIG = {
            DEFAULT_VARS: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                SHOP_NAME: true, //店铺名字
                SELLER_NICK: true, //卖家昵称
                TRADE_MONEY: true, //订单金额
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                ARRIVAL_CITY: true, //到达城市
                PAYMENT_LINK: true, //付款链接
                LOGISTICS_COMPANY: true, //物流公司
                LOGISTICS_LINK: true, //物流链接
                CONFIRM_GOODS_LINK: true, //收货链接
                OUT_SID: true, //运单号,
                VIP_GRADE: true, //会员等级
                REFUND_TIME: true, //退款时间
                REFUND_FEE: true, //退款金额
                REASON: true, //退款原因
                REFUND_DETAIL: true, //退款详情
                TRADE_DETAIL: true, //订单详情
                RATE_SHORT_LINK: true, //评价链接
                RATE_DETAIL_LINK: true, //评价详情
                RATE_RESULT: true, //评价结果
                BUYER_MOBILE: true //买家手机号
            },
            //下单关怀
            ORDER_CREATE_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                TRADE_DETAIL: true //订单详情
            },
            //常规催付
            NON_PAYMENT_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                PAYMENT_LINK: true, //付款链接
                TRADE_DETAIL: true //订单详情
            },
            //二次催付
            AGAIN_NON_PAYMENT_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                PAYMENT_LINK: true //付款链接
            },
            //聚划算催付
            JHS_NON_PAYMENT_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                PAYMENT_LINK: true //付款链接
            },
            //预售催订金
            PRESELL_FRONT_NOPAID_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                PAYMENT_LINK: true, //付款链接
                TRADE_DETAIL: true //订单详情
            },
            //征集预售催付
            PRESELL_NON_PAYMENT_INFORM: {},
            //发货提醒
            DELIVER_GOODS_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                SHOP_NAME: true, //店铺名字
                SELLER_NICK: true, //卖家昵称
                TRADE_MONEY: true, //订单金额
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                ARRIVAL_CITY: true, //到达城市
                LOGISTICS_COMPANY: true, //物流公司
                LOGISTICS_LINK: true, //物流链接
                OUT_SID: true //运单号
            },
            //派件提醒
            DELIVERY_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                SELLER_NICK: true, //卖家昵称
                TRADE_MONEY: true, //订单金额
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                ARRIVAL_CITY: true, //到达城市
                LOGISTICS_COMPANY: true, //物流公司
                LOGISTICS_LINK: true, //物流链接
                OUT_SID: true //运单号
            },
            //签收提醒
            SIGN_IN_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                SHOP_NAME: true, //店铺名字
                SELLER_NICK: true, //卖家昵称
                TRADE_MONEY: true, //订单金额
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                ARRIVAL_CITY: true, //到达城市
                LOGISTICS_COMPANY: true, //物流公司
                CONFIRM_GOODS_LINK: true, //收货链接
                OUT_SID: true //运单号
            },
            //付款关怀
            PAYMENT_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true //下单时间
            },
            //预售付订金关怀
            PRESELL_FRONT_PAID_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true //下单时间
            },
            //预售付尾款关怀
            PRESELL_FINAL_PAID_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                TRADE_DETAIL: true //订单详情
            },
            //回款提醒
            AFFIRM_GOODS_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                CONFIRM_GOODS_LINK: true, //收货链接
                RATE_SHORT_LINK: true //评价链接
            },
            //买家申请退款
            WAIT_SELLER_AGREE: {
                BUYER_NICK: true, //买家昵称
                TRADE_ID: true, //订单号
                REFUND_FEE: true, //退款金额
                REFUND_TIME: true, //退款申请时间
                REASON: true, //退款原因
                REFUND_DETAIL: true //退款详情
            },
            //退款成功
            REFUND_SUCCESS: {
                BUYER_NICK: true, //买家昵称
                TRADE_ID: true, //订单号
                REFUND_FEE: true, //退款金额
                REFUND_TIME: true, //退款申请时间
                REASON: true, //退款原因
                REFUND_DETAIL: true //退款详情
            },
            //卖家同意退款等待买家退货
            WAIT_BUYER_RETURN_GOODS: {
                BUYER_NICK: true, //买家昵称
                TRADE_ID: true, //订单号
                REFUND_FEE: true, //退款金额
                REFUND_TIME: true, //退款申请时间
                REASON: true, //退款原因
                REFUND_DETAIL: true //退款详情
            },
            //卖家拒绝退款
            SELLER_REFUSE_BUYER: {
                BUYER_NICK: true, //买家昵称
                TRADE_ID: true, //订单号
                REFUND_FEE: true, //退款金额
                REFUND_TIME: true, //退款申请时间
                REASON: true, //退款原因
                REFUND_DETAIL: true //退款详情
            },
            //中差评提醒
            REMIND_SELLER_INFORM: {
                BUYER_NICK: true, //买家昵称
                BUYER_MOBILE: true, //买家手机号
                RATE_RESULT: true, //评价结果
                RATE_DETAIL_LINK: true //评价详情
            },
            //中差评安抚
            NEUTRAL_BAD_RATE_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                RATE_SHORT_LINK: true, //评价链接
                TRADE_ID: true //订单号
            },
            //好评提醒
            GOOD_RATE_INFORM: {
                RATE_SHORT_LINK: true //评价链接
            },
            //未评价提醒
            NO_RATE_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                TRADE_ID: true, //订单号
                RATE_SHORT_LINK: true //评价链接
            },
            //延迟提醒
            DELAYED_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                SHOP_NAME: true, //店铺名字
                SELLER_NICK: true, //卖家昵称
                TRADE_MONEY: true, //订单金额
                TRADE_ID: true, //订单号
                TRADE_DETAIL: true //订单详情
            },
            //手动提醒
            MANUAL_INFORM: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                SELLER_NICK: true, //卖家昵称
                TRADE_ID: true, //订单号
                PAYMENT_LINK: true, //付款链接,
                LOGISTICS_LINK: true, //物流链接
                CONFIRM_GOODS_LINK: true, //收货链接
                RATE_SHORT_LINK: true, //评价链接
                TRADE_DETAIL: true, //订单详情
                REFUND_DETAIL: true //退款详情
            },
            //营销
            MARKETING_INFORM: {},
            //同城到达
            SEND_CITY: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                SELLER_NICK: true, //卖家昵称
                TRADE_MONEY: true, //订单金额
                TRADE_ID: true, //订单号
                TRADE_CREATE_TIME: true, //下单时间
                ARRIVAL_CITY: true, //到达城市
                LOGISTICS_COMPANY: true, //物流公司
                LOGISTICS_LINK: true, //物流链接
                OUT_SID: true //运单号
            },
            //万人团预售催尾款
            PRESELL_FINAL_NOPAID_INFORM: {},
            //万人团付款关怀
            PRESELL_PAYMENT_INFORM: {},
            //征集成功付款关怀
            PRESELL_PAYMENT_SUCCESS_INFORM: {},
            //预售失败关怀
            PRESELL_PAYMENT_FAILURE_INFORM: {},
            //营销
            MARKETING: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                VIP_GRADE: true
            },
            UPLOAD_FILE: {},
            //跨店营销
            SHOP_UNION_MARKETING: {
                BUYER_NICK: true //买家昵称
            },
            CONTINUOUS_MARKETING: {
                BUYER_NICK: true, //买家昵称
                RECEIVER_NAME: true, //买家姓名
                VIP_GRADE: true //会员等级
            }
        };
        //短信变量map
        var MSG_VAR_OBJ = {
            //买家昵称
            BUYER_NICK: {
                name: "BUYER_NICK",
                text: "买家昵称",
                modelValue: "#BUYER_NICK#",
                contentValue: "",
                previewValue: "武神",
                count: 8
            },
            //买家姓名
            RECEIVER_NAME: {
                name: "RECEIVER_NAME",
                text: "买家姓名",
                modelValue: "#RECEIVER_NAME#",
                contentValue: "",
                previewValue: "赵铁柱",
                count: 4
            },
            //店铺名字
            SHOP_NAME: {
                name: "SHOP_NAME",
                text: "店铺名字",
                modelValue: "#SHOP_NAME#",
                contentValue: "",
                previewValue: "赵铁柱小铺",
                count: 8
            },
            //卖家昵称
            SELLER_NICK: {
                name: "SELLER_NICK",
                text: "卖家昵称",
                modelValue: "#SHOP_NAME#",
                contentValue: "",
                previewValue: "店小二",
                count: 8
            },
            //订单金额
            TRADE_MONEY: {
                name: "TRADE_MONEY",
                text: "订单金额",
                modelValue: "#TRADE_MONEY#",
                contentValue: "",
                previewValue: "100,000",
                count: 4
            },
            //订单号
            TRADE_ID: {
                name: "TRADE_ID",
                text: "订单号",
                modelValue: "#TRADE_ID#",
                contentValue: "",
                previewValue: "952709527095270",
                count: 15
            },
            //下单时间
            TRADE_CREATE_TIME: {
                name: "TRADE_CREATE_TIME",
                text: "下单时间",
                modelValue: "#TRADE_CREATE_TIME#",
                contentValue: "",
                previewValue: "2013-01-01 12:00:00",
                count: 19
            },
            //到达城市
            ARRIVAL_CITY: {
                name: "ARRIVAL_CITY",
                text: "到达城市",
                modelValue: "#ARRIVAL_CITY#",
                contentValue: "",
                previewValue: "杭州",
                count: 4
            },
            //付款链接
            PAYMENT_LINK: {
                name: "PAYMENT_LINK",
                text: "付款链接",
                modelValue: "#PAYMENT_LINK#",
                contentValue: "",
                previewValue: "c.tb.cn/xxxxx",
                count: 16
            },
            //物流公司
            LOGISTICS_COMPANY: {
                name: "LOGISTICS_COMPANY",
                text: "物流公司",
                modelValue: "#LOGISTICS_COMPANY#",
                contentValue: "",
                previewValue: "全通",
                count: 4
            },
            //物流链接
            LOGISTICS_LINK: {
                name: "LOGISTICS_LINK",
                text: "物流链接",
                modelValue: "#LOGISTICS_LINK#",
                contentValue: "",
                previewValue: "http://物流xxxxxxxxxx",
                count: 12
            },
            //收货链接
            CONFIRM_GOODS_LINK: {
                name: "CONFIRM_GOODS_LINK",
                text: "收货链接",
                modelValue: "#CONFIRM_GOODS_LINK#",
                contentValue: "",
                previewValue: "http://收货xxxxxxxxxx",
                count: 12
            },
            //运单号
            OUT_SID: {
                name: "OUT_SID",
                text: "运单号",
                modelValue: "#OUT_SID#",
                contentValue: "",
                previewValue: "3322xxxxxxxx",
                count: 12
            },
            //会员等级
            VIP_GRADE: {
                name: "VIP_GRADE",
                text: "会员等级",
                modelValue: "#VIP_GRADE#",
                contentValue: "",
                previewValue: "至尊VIP",
                count: 5
            },
            //退款申请时间
            REFUND_TIME: {
                name: "REFUND_TIME",
                text: "退款申请时间",
                modelValue: "#REFUND_TIME#",
                contentValue: "",
                previewValue: "2013-01-01 12:00:00",
                count: 19
            },
            //退款金额
            REFUND_FEE: {
                name: "REFUND_FEE",
                text: "退款金额",
                modelValue: "#REFUND_FEE#",
                contentValue: "",
                previewValue: "XXX元",
                count: 4
            },
            //退款原因
            REASON: {
                name: "REASON",
                text: "退款原因",
                modelValue: "#REASON#",
                contentValue: "",
                previewValue: "因为XXX原因，而选择退款",
                count: 12
            },
            //订单详情
            TRADE_DETAIL: {
                name: "TRADE_DETAIL",
                text: "订单详情",
                modelValue: "#TRADE_DETAIL#",
                contentValue: "",
                previewValue: "订单详情xxx",
                count: 16
            },
            //退款详情
            REFUND_DETAIL: {
                name: "REFUND_DETAIL",
                text: "退款详情",
                modelValue: "#REFUND_DETAIL#",
                contentValue: "",
                previewValue: "退款详情xxx",
                count: 16
            },
            //评价连接
            RATE_SHORT_LINK: {
                name: "RATE_SHORT_LINK",
                text: "评价连接",
                modelValue: "#RATE_SHORT_LINK#",
                contentValue: "",
                previewValue: "http://评价xxxxxxxxx",
                count: 16
            },
            //买家手机号
            BUYER_MOBILE: {
                name: "BUYER_MOBILE",
                text: "买家手机号",
                modelValue: "#BUYER_MOBILE#",
                contentValue: "",
                previewValue: "137xxx4432",
                count: 11
            },
            //评价结果
            RATE_RESULT: {
                name: "RATE_RESULT",
                text: "评价结果",
                modelValue: "#RATE_RESULT#",
                contentValue: "",
                previewValue: "差评",
                count: 2
            }, //评价详情
            RATE_DETAIL_LINK: {
                name: "RATE_DETAIL_LINK",
                text: "评价详情",
                modelValue: "#RATE_DETAIL_LINK#",
                contentValue: "",
                previewValue: "http://评价详情xxxxxxxxx",
                count: 16
            }
        };
        //接收人枚举
        var MSG_RECEIVER_TYPE = [{
            key: 0,
            value: "订单收货人(默认必选)",
            text: "默认短信都发送至订单的收货人。此三项都开启时优先顺序为：1.买家留言指定；2.支付宝帐号；3.订单收货人；提示：短信只会发送至满足条件的一个对象",
            disabled: true
        }, {
            key: 1,
            value: "优先支付宝帐号",
            text: "若买家支付宝帐号为手机号时短信优先发给此手机号",
            disabled: false
        }, {
            key: 2,
            value: "优先买家留言指定",
            text: "优先发送至买家留言中指定的号码，留言中指定号码书写规则：#接收短信手机号#，例：#13800138000#。此功能常用于礼品类目，使用此方式需在店铺中给出提示；",
            disabled: false
        }, {
            key: 3,
            value: "会员基础联系人手机号",
            text: "基础联系人信息来源于会员第一笔订单的收货人。此信息可手工变更，但修改后不会影响收货人信息",
            disabled: false
        }, {
            key: 4,
            value: "最后一笔订单收货人手机号",
            text: "会员在本店下过多笔订单时会发送至最后一笔订单的收货人；如果只有一笔订单即为此笔订单的收货人",
            disabled: false
        }];
        //域名集合
        var DOMAIN_ARRAY = [
            "\\.top",
            "\\.com",
            "\\.net",
            "\\.cn",
            "\\.org",
            "\\.xyz",
            "\\.wang",
            "\\.club",
            "\\.site",
            "\\.link",
            "\\.ren",
            "\\.click",
            "\\.date",
            "\\.website",
            "\\.space",
            "\\.tech",
            "\\.one",
            "\\.help",
            "\\.com.cn",
            "\\.gift",
            "\\.cc",
            "\\.hk",
            "\\.biz",
            "\\.mobi",
            "\\.love",
            "\\.tm",
            "\\.info",
            "\\.win",
            "\\.red",
            "\\.faith",
            "\\.pink",
            "\\.pics",
            "\\.sexy",
            "\\.photo",
            "\\.pw",
            "\\.net.cn",
            "\\.in",
            "\\.org.cn",
            "\\.gov.cn",
            "\\.me",
            "\\.name",
            "\\.pro",
            "\\.tv",
            "\\.ws",
            "\\.asia",
            "\\.tw",
            "\\.xxx",
            "\\.blue",
            "\\.host",
            "\\.ac.cn",
            "\\.bj.cn",
            "\\.sh.cn",
            "\\.tj.cn",
            "\\.cq.cn",
            "\\.he.cn",
            "\\.sx.cn",
            "\\.nm.cn",
            "\\.ln.cn",
            "\\.jl.cn",
            "\\.hl.cn",
            "\\.js.cn",
            "\\.zj.cn",
            "\\.ah.cn",
            "\\.fj.cn",
            "\\.jx.cn",
            "\\.sd.cn",
            "\\.ha.cn",
            "\\.hb.cn",
            "\\.hn.cn",
            "\\.gd.cn",
            "\\.gx.cn",
            "\\.hi.cn",
            "\\.sc.cn",
            "\\.gz.cn",
            "\\.yn.cn",
            "\\.xz.cn",
            "\\.sn.cn",
            "\\.gs.cn",
            "\\.qh.cn",
            "\\.nx.cn",
            "\\.xj.cn",
            "\\.tw.cn",
            "\\.hk.cn",
            "\\.mo.cn",
            "\\.eu",
            "\\.la",
            "\\.us",
            "\\.ca",
            "\\.bz",
            "\\.de",
            "\\.tv",
            "\\.tc",
            "\\.vg",
            "\\.ms",
            "\\.gs",
            "\\.jp",
            "\\.co.uk",
            "\\.org.uk",
            "\\.me.uk",
            "\\.ac",
            "\\.io",
            "\\.sh",
            "\\.nl",
            "\\.at",
            "\\.be",
            "\\.co",
            "\\.berlin",
            "\\.es",
            "\\.mn",
            "\\.sc",
            "\\.vega"
        ];

        init();

        function init() {
            MSG_VAR_CONFIG = $.extend({}, MSG_VAR_CONFIG, $smsVarsConfig);
        }

        function getVarByName(name) {
            return MSG_VAR_OBJ[name];
        }

        function getVarsByType(type) {
            var config = MSG_VAR_CONFIG[type];
            return $.map(config, function(item, i) {
                return item ? i : null;
            })
        }

        function getVars() {
            return MSG_VAR_OBJ;
        }

        function contentToModel(value) {
            if (!value) {
                return "";
            }
            var vars = getVars();
            var result = value;
            angular.forEach(vars, function(item) {
                result = result.replace(new RegExp("<img[^<>]+?" + item.name + "[^<>]+?>", "ig"), item.modelValue);
            });
            result = filterTag(result);
            return result;
        }

        function modelToContent(value) {
            if (!value) {
                return "";
            }
            var vars = getVars();
            var result = value;
            angular.forEach(vars, function(item) {
                var html = '<img class="variable" data-key="' + item.name + '"  src="/static/seller/app/images/informBox/' + item.name + '.png" />';
                result = result.replace(new RegExp(item.modelValue, "ig"), html);
            });
            result = result.replace(/^\s+|\s+$/ig, "&nbsp;");
            return result;
        }

        function contentToPreview(content, sign) {
            var vars = getVars();
            var result = content || "";
            sign = sign ? $enum.getEnumValueByKey("signature", sign) : "";
            angular.forEach(vars, function(item) {
                var previewValue = '<span>' + item.previewValue + '</span>';
                result = result.replace(new RegExp("<img[^<>]+?" + item.name + "[^<>]+?>", "ig"), previewValue);
            });

            result = sign ? ("【" + sign + "】" + result) : result;

            return result;
        }

        function modelToPreview(value, sign) {
            var vars = getVars();
            var result = value || "";
            sign = sign ? $enum.getEnumValueByKey("signature", sign) : "";
            angular.forEach(vars, function(item) {
                var previewValue = '<span>' + item.previewValue + '</span>';
                result = result.replace(new RegExp(item.modelValue, "ig"), previewValue);
            });
            result = sign ? ("【" + sign + "】" + result) : result;

            return result;
        }

        function filterTag(str) {
            str = str.replace(/<\/?[^>]*>/g, "");
            str = str.replace(/&nbsp;/ig, " ");
            str = str.replace(/\s+/ig, ' ');
            str = str.replace(/&amp;/ig, "&");
            str = str.replace(/&lt;/ig, "<");
            str = str.replace(/&gt;/ig, ">");
            str = str.replace(/&quot;/ig, '"');
            str = str.replace(/&copy;/ig, "©");
            str = str.replace(/&reg;/ig, "®");
            str = str.replace(/&yen;/ig, "￥");
            str = str.replace(/(\r)*\n/g, "");

            return str
        }

        function getSmsReceiverType(keys) {
            var result = [];
            angular.forEach(MSG_RECEIVER_TYPE, function(item) {
                if (keys.indexOf(item.key) != -1) {
                    result.push(item);
                }
            });
            return result;
        }

        function hasUrl(str) {
            var reg = new RegExp(DOMAIN_ARRAY.toString().replace(/,/ig, "|"), "ig");
            return reg.test(str);
        }

        function validate(template) {
            if (template.content == "") {
                $win.alert('短信内容不能为空');
                return false;
            }

            var reg1 = new RegExp(/[【】]/);
            if (reg1.test(template.content)) {
                $win.alert("短信内容存在不合法字符“【”或者“】”,请删除后再提交");
                return false;
            }
            return true;
        }

        function dealFail(data) {
            var result;
            switch (Number(data.resultCode)) {
                case 60000:
                case 60001:
                    result = $win.confirm({
                        title: "您当前的短信不足无法开启此任务",
                        content: "您当前的短信结余为 0，任务无法创建及执行，请先充值短信后再试，谢谢！",
                        img: "images/components/alert/alert-no-message.png",
                        showClose: false,
                        cancelText: "前往充值",
                        redirectCancel: "#/setting/SMSTopUp",
                        size: "lg"
                    }).result;
                    break;
                case 30029:
                case 30030:
                    result = $win.confirm({
                        title: '含有敏感关键词无法保存，请修改！',
                        content: data.resultMessage,
                        img: "images/components/alert/alert-forbid.png",
                        showClose: false,
                        cancelText: "知道了",
                        size: "lg"
                    }).result;
                    break;
                case 30031:
                    result = $win.confirm({
                        title: "含有长连接",
                        content: data.resultMessage,
                        img: "images/components/alert/alert-question.png",
                        closeText: "继续保存",
                        cancelText: "返回修改",
                        size: "lg"
                    }).result;
                    break;
                case 30042:
                    result = $win.confirm({
                        title: "请确认短信中的链接前后是否有加空格？",
                        //content: '您短信中包含 <span class="text-danger">跳转链接</span>，请确保您的跳转链接前后都要加上 <span class="text-danger">空格</span>，否则有可能会导致链接无法打开！！！',
                        content: data.resultMessage,
                        img: "images/components/alert/alert-question.png",
                        closeText: "继续保存",
                        cancelText: "返回修改",
                        size: "lg"
                    }).result;
                    break;
                default:
                    var resultMessage = data.resultMessage.split("|||"),
                        length = resultMessage.length,
                        title = length > 1 ? resultMessage[0] : "错误提醒",
                        content = length > 1 ? resultMessage[1] : resultMessage[0];
                    result = $win.confirm({
                        title: title,
                        content: content,
                        img: "images/components/alert/alert-forbid.png",
                        showClose: false,
                        cancelText: "知道了",
                        size: "lg"
                    }).result;
            }


            return result;
        }

        function getSignatureById(key) {
            return $enum.getEnumValueByKey("signature", key);
        }

        function clearMsgAttrs(entity) {
            delete entity.signatureId;
            delete entity.receiverType;
            delete entity.mobile;
            delete entity.viewValue;
            return entity;
        }

        return {
            //根据name获取变量
            getVarByName: getVarByName,
            //根据类型获取变量配置
            getVarsByType: getVarsByType,
            //获取变量集合
            getVars: getVars,
            //视图->模型
            contentToModel: contentToModel,
            //模型->视图
            modelToContent: modelToContent,
            //视图->预览
            contentToPreview: contentToPreview,
            //模型->预览
            modelToPreview: modelToPreview,
            //过滤标签
            filterTag: filterTag,
            //获取短信接收人
            getSmsReceiverType: getSmsReceiverType,
            //检查是否存在Url
            hasUrl: hasUrl,
            //短信提交失败处理
            dealFail: dealFail,
            //验证短信内容
            validate: validate,
            //获取签名内容
            getSignatureById: getSignatureById,
            //清楚短信属性
            clearMsgAttrs: clearMsgAttrs
        }
    }]);

angular.module("dp.ui.smsEditor")
    //编辑器控件
    .directive("dpSmsEditor", ["$smsData", "$sniffer", "$browser", "$modal", "$restClient", "$support", "$win", "$smsType", "$enum",
        function($smsData, $sniffer, $browser, $modal, $restClient, $support, $win, $smsType, $enum) {
            var DEFAULTS = {
                type: "",
                customerDefinedType: "", //短信子类型
                signatureSource: $enum.getEnum("signature") || [], //签名列表,
                showBack: true, //退订回T
                showTmplOperation: true, //显示引用模板
                showUrlCreator: true, //显示生成短链接
                tmpVars: [], //临时变量
                vars: [] //系统变量
            };

            var controller = function($scope, $element, $attrs) {
                $scope.ctrl = this;
            };

            var link = function(scope, element, attrs, ctrl) {
                //编辑器
                var $editor = element.find(".editor");
                //变量标签
                var $varLabels = element.find(".param-list");
                //退订
                var $unsubscribe = element.find(".unsubscribe");
                //ngModel控制器
                var ngModelCtrl = ctrl[0];
                var range;
                var $counter = element.find(".input-count");
                var $messageCounter = element.find(".msg-total-count");

                init();

                scope.$watch("signature", function(newValue) {
                    action();
                });

                //覆盖$render
                ngModelCtrl.$render = function() {
                    ngModelCtrl.$viewValue ? removePlaceholder() : addPlaceholder();
                    $editor.html(ngModelCtrl.$viewValue);
                };

                function addPlaceholder() {
                    $editor.css("background", "url(https://img.alicdn.com/imgextra/i2/78622573/TB2UVMIbUdnpuFjSZPhXXbChpXa_!!78622573.jpg) no-repeat right top");
                }

                function removePlaceholder() {
                    $editor.css("background", "none");
                }

                //加入转换流程
                ngModelCtrl.$formatters.push($smsData.modelToContent);
                ngModelCtrl.$parsers.unshift($smsData.contentToModel);

                //申请签名
                scope.applySignature = function() {
                    var modalInstance = $modal.open({
                        templateUrl: COMMON_SOURCE_PATH + 'views/smsBox/applySignature.html',
                        controller: 'applySignatureCtrl',
                        backdrop: true,
                        resolve: {
                            $data: function() {
                                return {
                                    content: $smsData.contentToModel($editor.html()),
                                    informType: scope.options.type
                                }
                            }
                        }
                    });

                    modalInstance.result.then(function(value) {
                        $win.alertSuccess(value);
                        scope.showApplySignature = false;
                        scope.signatureAuditStatus = getSignatureAuditStatus(2);
                    });

                };

                //另存为短语库
                scope.saveToLibrary = function() {
                    var modalInstance = $modal.open({
                        templateUrl: COMMON_SOURCE_PATH + 'views/smsBox/saveToLibrary.html',
                        controller: 'saveToLibraryCtrl',
                        backdrop: true,
                        resolve: {
                            $data: function() {
                                return {
                                    content: $smsData.contentToModel($editor.html()),
                                    informType: scope.options.type
                                }
                            }
                        },
                        size: "sm"
                    });

                    modalInstance.result.then(function(value) {
                        $win.alertSuccess(value);
                    });
                };

                //引用短语库
                scope.selectFromLibrary = function() {
                    var modalInstance = $modal.open({
                        templateUrl: COMMON_SOURCE_PATH + 'views/smsBox/templateLibrary.html',
                        controller: 'smsLibraryCtrl',
                        windowClass: "template-library-modal",
                        backdrop: true,
                        size: "lg",
                        resolve: {
                            $data: function() {
                                return {
                                    type: scope.options.type
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function(template) {
                        $editor.html($smsData.modelToContent(template.content));
                        action();
                    });
                };

                //创建短链接
                scope.createShortLink = function() {
                    var modalInstance = $modal.open({
                        templateUrl: COMMON_SOURCE_PATH + 'views/smsBox/createShortLink.html',
                        controller: 'createShortLinkCtrl',
                        backdrop: true
                    });

                    modalInstance.result.then(function(link) {
                        insertText("&nbsp;" + link + "&nbsp;");
                    });
                };

                function init() {
                    scope.innerVariables = [];
                    scope.outerVariables = [];
                    scope.chargingTip = "70字计一条短信，超出70字按每条67字计费;每一字母、数字、标点符号都按一字计算;使用变量时,按实际变量替换计算有可能超出默认字数";
                    //获取签名审核状态
                    $restClient.get("seller/template/auditStatus", null, function(data) {
                        scope.showApplySignature = typeof data.data.auditStatus == "undefined";
                        scope.signatureAuditStatus = getSignatureAuditStatus(data.data.auditStatus);
                    });
                    //生成配置项
                    scope.options = $.extend({}, DEFAULTS, scope.options);
                    //根据配置项渲染控件
                    initEditor();
                    initRangeObj();
                    bindEditor();
                    bindControls();
                    initController();
                }

                function initEditor(options) {
                    scope.options = $.extend(scope.options, options || {});
                    //变量配置
                    var totalVars = [];
                    angular.forEach(scope.options.vars, function(key) {
                        var obj = angular.extend($smsData.getVarByName(key));
                        totalVars.push(obj);
                    });

                    angular.forEach(scope.options.tmpVars, function(item) {
                        var obj = {
                            name: item,
                            text: item,
                            isTmp: true
                        };
                        totalVars.push(obj);
                    });

                    if (totalVars.length < 3) {
                        scope.innerVariables = totalVars;
                    } else {
                        scope.innerVariables = totalVars.splice(0, 3);
                        scope.outerVariables = totalVars;
                    }
                    //签名配置
                    scope.signatureSource = scope.options.signatureSource;

                    if (options) {
                        scope.$apply();
                    }
                }

                function getSignatureAuditStatus(status) {
                    switch (status) {
                        case 0: //审核未通过
                            {
                                return "";
                            }
                        case 1: //审核通过
                            {
                                return "";
                            }
                        case 2: //审核中
                            {
                                return "审核中";
                            }
                        case 3: //平台审核中
                            {
                                return "";
                            }
                        default:
                            {
                                return ""
                            }
                    }
                }

                function initRangeObj() {
                    if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment) {
                        Range.prototype.createContextualFragment = function(h) {
                            var j = document.createDocumentFragment(),
                                i = document.createElement("div");
                            j.appendChild(i);
                            i.outerHTML = h;
                            return j
                        }
                    }
                    if ((typeof TextRange !== "undefined") && !TextRange.prototype.createContextualFragment) {
                        TextRange.prototype.createContextualFragment = function(h) {
                            var j = document.createDocumentFragment(),
                                i = document.createElement("div");
                            j.appendChild(i);
                            i.outerHTML = h;
                            return j
                        }
                    }
                }

                function bindEditor() {
                    $editor.on({
                        mouseup: refreshRange,
                        keyup: refreshRange
                    });


                    if ($sniffer.hasEvent('input')) {
                        $editor.on('input', action);
                    } else {
                        var timeout;
                        var deferAction = function() {
                            if (!timeout) {
                                timeout = $browser.defer(function() {
                                    action();
                                    timeout = null;
                                });
                            }
                        };

                        $editor.on('keydown', function(event) {
                            var key = event.keyCode;
                            //  ignore  command  modifiers  arrows
                            if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) return;

                            deferAction();
                        });

                        // if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
                        if ($sniffer.hasEvent('paste')) {
                            $editor.on('paste cut', deferAction);
                        }
                    }

                    $editor.on("DOMCharacterDataModified", action);

                    // if user paste into input using mouse on older browser
                    // or form autocomplete on newer browser, we need "change" event to catch it
                    $editor.on('change', action);
                }

                function bindControls() {
                    $varLabels.on("click", ".param", function(event) {
                        var key = $(event.currentTarget).data("key");
                        insertVariable(key);
                    });

                    $varLabels.on("click", ".tmp-param", function(event) {
                        var key = $(event.currentTarget).data("key");
                        insertText(key);
                    });

                    $unsubscribe.on("click", function(event) {
                        insertText("回T退订");
                    })

                }

                function action() {
                    var value = $editor.html();
                    //设置编辑器背景
                    value ? removePlaceholder() : addPlaceholder();
                    if (ngModelCtrl.$viewValue !== value) {
                        //是否处于digest
                        if (scope.$root.$$phase) {
                            ngModelCtrl.$setViewValue(value);
                        } else {
                            scope.$apply(function() {
                                ngModelCtrl.$setViewValue(value);
                            });
                        }
                    }
                    var count = calculateCount(value);
                    $counter.text(count);
                    $messageCounter.text(count <= 70 ? 1 : Math.ceil(count / 67));
                    //渲染预览窗口
                    scope.changedAction({
                        signature: scope.signature,
                        content: value
                    })
                }

                //计算字数
                function calculateCount(content) {
                    var count = $("<div></div>").append(content).text().length || 0;
                    var varList = $("<div></div>").append(content).find("img");

                    angular.forEach(varList, function(item) {
                        count += $smsData.getVarByName($(item).data("key")).count;
                    });
                    if (scope.signature) {
                        var signature = $enum.getEnumValueByKey("signature", scope.signature);
                        var signatureLength = signature ? signature.length + 2 : 0;
                        count += signatureLength;
                    }

                    if (!scope.options.showBack) {
                        count += 4;
                    }
                    return count;
                }

                function refreshRange() {
                    var selection = window.getSelection ? window.getSelection() : document.selection;
                    try {
                        range = selection.createRange ? selection.createRange() : selection.getRangeAt(0)
                    } catch (b) {}
                }

                function getNewRange() {
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range)
                }

                //插入HTML
                function insertHtml(html) {
                    if (range == undefined) {
                        $editor.prepend(html);
                        $editor.focus();
                        refreshRange();
                        if ($support.ie && $support.version != 8) {
                            getSelection();
                        }
                    } else {
                        var d = range.createContextualFragment(html);
                        range.collapse(false);
                        var b = d.lastChild;
                        if ($support.ie && $support.version == 8) {
                            range.pasteHTML(html)
                        } else {
                            range.insertNode(d);
                            if (b) {
                                range.setStartAfter(b)
                            }
                            getNewRange();
                        }
                        $editor.focus()
                    }
                }

                //插入变量
                function insertVariable(key) {
                    html = '<img class="variable" data-key="' + key + '"  src="/static/seller/app/images/informBox/' + key + '.png" />';
                    insertHtml(html);
                    action();
                }

                //插入文字
                function insertText(text) {
                    var html = text;
                    insertHtml(html);
                    action();
                }

                function initController() {
                    scope.ctrl.insertVariable = insertVariable;
                    scope.ctrl.insertHtml = insertHtml;
                    scope.ctrl.initEditor = initEditor;
                    scope.ctrl.insertText = insertText;
                }

                //插入外部变量
                scope.$watch('innerVars', function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        newValue && insertText(newValue);
                    }
                })
            };

            return {
                restrict: "EA",
                scope: {
                    changedAction: "&", //编辑完成后动作,
                    signature: "=", //签名
                    ctrl: "=ctrl",
                    options: "=dpSmsEditor"
                },
                templateUrl: COMMON_SOURCE_PATH + "views/smsBox/smsEditor.html",
                require: ["?ngModel"],
                controller: controller,
                link: link
            }
        }
    ])
    //存入短语库控制器
    .controller("saveToLibraryCtrl", ["$scope", "$modalInstance", "$data", "$restClient", "$win", function($scope, $modalInstance, $data, $restClient, $win) {
        $scope.templatName = "";
        $scope.save = function() {
            if (!$scope.templateName) {
                $win.alert("模板名称不能为空");
                return;
            }

            $restClient.post("seller/template", null, {
                name: $scope.templateName,
                content: $data.content,
                informType: $data.informType
            }, function(data) {
                $modalInstance.close(data.resultMessage);
            });
        };

        $scope.cancel = function() {
            $modalInstance.dismiss();
        }
    }])
    //引用短语库控制器
    .controller("smsLibraryCtrl", ["$scope", "$data", "$modalInstance", "$restClient", "$smsType", "$win", "$q", "$rootScope", "$smsData",
        function($scope, $data, $modalInstance, $restClient, $smsType, $win, $q, $rootScope, $smsData) {
            $scope.keyword = "系统短信";
            $scope.systemLibrary = null;
            $scope.customLibrary = null;

            $scope.useTemplate = function(template) {
                $modalInstance.close(template);
            };

            $scope.deleteTemplate = function(template, event) {
                var config = {
                    img: "images/components/alert/alert-delete.png",
                    title: "您确定要删除吗？",
                    content: "删除后将无法恢复，请慎重操作！",
                    windowTitle: "系统提示"
                };

                $win.confirm(config).result.then(function() {
                    $scope.dealing = $restClient.deletes("seller/template", {
                        id: template.id
                    }, function(data) {
                        $win.alert({
                            type: "success",
                            content: data.resultMessage
                        });
                        getList();
                    });
                });
            };

            $scope.cancel = function() {
                $modalInstance.dismiss();
            };

            $scope.$watch("keyword", function(oldValue, newValue) {
                if (oldValue != newValue) {
                    getList();
                }
            })

            function init() {
                $scope.type = $data.type;
                getList();
            }

            function getList() {
                var param = {
                    informType: $scope.type,
                    keyword: $scope.keyword
                };

                $scope.loading = $restClient.post("seller/template/search", null, param, function(data) {
                    $scope.systemLibrary = filter(data.data.defaultTemplates);
                    $scope.customLibrary = filter(data.data.templates);
                }).$promise;
            }

            function filter(templateArray) {
                angular.forEach(templateArray, function(item) {
                    item.preview = $smsData.modelToPreview(item.content);
                });
                return templateArray;
            }

            init();
        }
    ])

//生成短链接
.controller("createShortLinkCtrl", ["$scope", "$modalInstance", "$restClient", "$win", "w5cValidator",
        function($scope, $modalInstance, $restClient, $win, w5cValidator) {
            $scope.linkType = "LT_ACTIVITY";
            $scope.pageLink = "";
            $scope.commodityId = "";

            $scope.save = function() {
                var linkData = "";
                if (!validate()) {
                    return false;
                }

                switch ($scope.linkType) {
                    case "LT_ACTIVITY":
                        {
                            linkData = $scope.pageLink;
                            break;
                        }
                    case "LT_ITEM":
                        {
                            linkData = $scope.commodityId;
                            break;
                        }
                    case "LT_SHOP":
                        {}
                }


                $restClient.postFormData("seller/template/shortLink", {
                    linkType: $scope.linkType,
                    linkData: linkData
                }, {
                    successCallback: function(data) {
                        $modalInstance.close($.trim(data.data));
                    }
                })
            };

            $scope.cancel = function() {
                $modalInstance.dismiss();
            };

            function validate() {
                //页面链接
                if ($scope.linkType == "LT_ACTIVITY") {
                    if (!$scope.pageLink) {
                        $win.alert({
                            content: "页面链接不能为空",
                            autoClose: true,
                            duration: 1000
                        });
                        return false;
                    }
                }
                //宝贝链接
                else if ($scope.linkType == "LT_ITEM") {
                    if (!$scope.commodityId) {
                        $win.alert({
                            content: "商品ID不能为空",
                            autoClose: true,
                            duration: 1000
                        });
                        return false;
                    }
                }

                return true;
            }


            init();

            function init() {

                w5cValidator.setRules({
                     pageLink: {
                        required: "页面链接不能为空"
                    },
                    commodityId: {
                        required: "宝贝链接不能为空"
                    }
                });

                $scope.validateOptions = {
                    blurTrig: true
                };

            }
        }
    ])
    //申请签名
    .controller("applySignatureCtrl", ["$scope", "$modalInstance", "$informData", "$restClient", "$win", "$timeout", "$q", function($scope, $modalInstance, $informData, $restClient, $win, $timeout, $q) {
        $scope.shopInfo = {};
        $scope.status = 0; //手机号是否通过验证
        $scope.isEdit = 0; //是否修改手机号
        $scope.isValidate = 0; //是否获取了验证码
        $scope.checkCodeTime = 0; //获取验证码倒计时
        $scope.showShopInfo = true;

        //获取验证码
        $scope.getCheckCode = function() {
            if ($scope.shopInfo.checkCodeMobile == "") {
                $win.alert("手机号码不能为空");
                return;
            }

            $restClient.get("seller/shopInfo/checkCode", { mobile: $scope.shopInfo.checkCodeMobile }, {
                successCallback: function() {
                    $scope.checkCodeTime = 60;
                    $scope.isValidate = 1;
                    timer();
                }
            })
        };

        $scope.modifyMobile = function() {
            $scope.isEdit = 1;
        };

        $scope.exitModifyMobile = function() {
            $scope.isEdit = 0;
        };

        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        $scope.save = function() {
            if (!validate()) {
                return;
            }
            //未通过验证
            if (!$scope.status) {
                $scope.loading = updateShopInfo();
            }
            //已通过验证
            else {
                $scope.loading = updateSignature();
            }
        };

        function validate() {
            if (!$scope.status) {
                if ($scope.shopInfo.realName == "") {
                    $win.alert("真是姓名不能为空");
                    return false;
                }

                if ($scope.shopInfo.checkCodeMobile == "") {
                    $win.alert("号码不能为空");
                    return false;
                }

                if ($scope.shopInfo.checkCode == "") {
                    $win.alert("验证码不能为空");
                    return false;
                }
            }

            if ($scope.shopName == "") {
                $win.alert("签名不能为空");
                return false;
            }
            return true;
        }

        function updateSignature() {
            return $restClient.post("seller/template/signature", { signatureContent: $scope.shopName }, null, function(data) {
                $modalInstance.close("签名申请提交成功，可联系在线客服加快审核！");
            }).$promise;
        }

        function updateShopInfo() {
            var postShopInfo = angular.copy($scope.shopInfo);
            postShopInfo.signatureContent = $scope.shopName;

            return $restClient.post("seller/template/signatureWithShopInfo", null, postShopInfo, function(data) {
                $modalInstance.close("签名申请提交成功，可联系在线客服加快审核！");
            }).$promise;
        }

        init();

        function init() {
            //获取店铺签名
            $restClient.get("seller/user/fullInfo", null, function(data) {
                $scope.shopName = data.data.shop.name;
            });

            $restClient.get("seller/shopInfo", null, {
                successCallback: function(data) {
                    $scope.shopInfo = serverToClient(data.data);
                    $scope.shopInfo.role = 0;
                    $scope.status = $scope.shopInfo.mobileStatus;
                    $scope.isEdit = !$scope.shopInfo.mobileStatus;
                    $scope.isValidate = !$scope.shopInfo.mobileStatus;
                }
            })
        }

        function timer() {
            $timeout(function() {
                $scope.checkCodeTime = $scope.checkCodeTime - 1;
                if ($scope.checkCodeTime > 0) {
                    timer();
                }
            }, 1000);
        }

        function serverToClient(entity) {
            entity.checkCodeMobile = entity.mobile;
            return entity;
        }
    }]);;

angular.module("dp.ui.smsEditor")
    //编辑框服务，返回编辑框控制器
    .factory("$dpSmsModal", ["$modal", function ($modal) {
        function open(data, options) {
            if (typeof options == "string") {
                options = {type: options};
            }

            return $modal.open({
                templateUrl: COMMON_SOURCE_PATH + "views/smsBox/smsModal.html",
                controller: "smsModalCtrl",
                windowClass: "sms-modal",
                resolve: {
                    $data: function () {
                        return {
                            data: data,
                            options: options
                        }
                    }
                },
                size: "lg"
            })
        }

        return {
            open: open
        }
    }])
    .controller("smsModalCtrl", ["$scope", "$compile", "$modalInstance", "$restClient", "$smsData", "$data", "$win", "$q", "$enum",
        function ($scope, $compile, $modalInstance, $restClient, $smsData, $data, $win, $q, $enum) {
            var DEFAULTS = {
                type: "",
                customerDefinedType: "",//短信子类型
                signatureSource: $enum.getEnum("signature") || [],//签名列表,
                showBack: true,//显示回T退订
                showTmplOperation: true, //显示引用模板
                showUrlCreator: true, //显示生成短链接
                tmpVars: [],//临时变量
                vars: [],//系统变量
                showReceiverType: true,//显示接收人
                receiverTypeOptions: "",//接收人列表
                isJoin: true,//是否显示正式加入
                title: "短信设置",//编辑框标题
                staticMode: false,//是否可关闭
                btnOkName: "保存",//操作名称
                showBtnOk: true, //是否显示保存按钮
                showBtnNo: true //是否显示取消按钮
            };

            init();

            function init() {
                $scope.boxStatus = {
                    opened: true,
                    enabled: false
                };
                $scope.entity = $data.data;
                $scope.options = $.extend({}, DEFAULTS, $data.options);
            }

            $scope.save = function (result) {
                return $q.when(true, function () {
                    $modalInstance.close(result);
                });
            };

            $scope.cancel = function (message) {
                $modalInstance.dismiss();
            };
        }]);
//单选、多选组
angular.module("dp.ui.select", [])
    .directive("dpSelectGroup", [function () {
        var controller = function ($scope, $element, $attrs) {
            var ctrl = this,
                items = ctrl.items = $scope.items = [];

            $scope.selectValue = Number.NaN;
            $scope.selectValueArray = [];

            //single or multi
            ctrl.isSingle = $scope.isSingle = $attrs.type.toLowerCase() == 'single';

            ctrl.select = function (curSelect) {
                $scope.selectValue = curSelect.value;
            };

            ctrl.selectMulti = function (curSelect) {
                var index = $scope.selectValueArray.indexOf(curSelect.value);
                index == -1 ? $scope.selectValueArray.push(curSelect.value) : $scope.selectValueArray.splice(index, 1);

                angular.forEach($scope.items, function (item) {
                    if (item.type == "limit") {
                        if ($scope.selectValueArray.length == 0) {
                            ctrl.setEmpty(item);
                            return;
                        }
                        var limitIndex = $scope.selectValueArray.indexOf(item.value);
                        limitIndex != -1 && $scope.selectValueArray.splice(limitIndex, 1);
                    }
                })
            };

            ctrl.format = function (data) {
                switch ($attrs.format) {
                    case "string":
                    {
                        return $.trim(data.toString());
                    }
                    case "integer":
                    {
                        return parseInt(data);
                    }
                    default :
                    {
                        return $.trim(data);
                    }
                }
            };

            ctrl.setEmpty = function (curSelect) {
                var length = $scope.selectValueArray.length;
                while (length--) {
                    $scope.selectValueArray.splice(length, 1);
                }

                $scope.selectValueArray.push(curSelect.value);
            }
        };

        var link = function (scope, element, attrs, ctrl) {
            //监控数据
            scope.$watch(scope.isSingle ? "selectValue" : "selectValueArray", function (newValue, oldValue) {
                if (newValue != oldValue) {
                    ctrl.$setViewValue(newValue);
                    ctrl.$render();
                }
            }, !scope.isSingle);

            //设置渲染模式
            ctrl.$render = scope.isSingle ? renderSingle : renderMulti;

            function renderSingle() {
                angular.forEach(scope.items, function (item) {
                    item.active = item.value == ctrl.$viewValue;
                });
                scope.selectValue = ctrl.$viewValue;
            }

            function renderMulti() {
                angular.forEach(scope.items, function (item) {
                    if (typeof ctrl.$viewValue != "undefined") {
                        item.active = ctrl.$viewValue.indexOf(item.value) != -1;
                    }
                });
                scope.selectValueArray = ctrl.$viewValue;
            }
        };

        return {
            restrict: "A",
            transclude: true,
            scope: {},
            replace: true,
            controller: controller,
            require: "ngModel",
            template: '<div class="condition-label-group" ng-transclude></div>',
            link: link
        }
    }])
    .directive("dpSelect", function () {
        return {
            restrict: "A",
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || "components/dpSelect.html";
            },
            transclude: true,
            scope: {
                num: "=",
                active: "@",
                text: "@"
            },
            replace: true,
            require: "?^dpSelectGroup",
            link: function (scope, element, attrs, groupCtrl, transclude) {
                var innerContent = element.find("[ng-transclude]").eq(0);
                scope.value = groupCtrl.format(attrs.value);
                scope.disabled = attrs.disabled == "true";
                groupCtrl.items.push(scope);
                scope.select = !scope.disabled ? function () {
                    groupCtrl.isSingle ? groupCtrl.select(scope) : groupCtrl.selectMulti(scope);
                } : angular.noop;

                transclude(scope, function (clone) {
                    innerContent.empty().append(clone);
                })
            }
        }
    })
    .directive("dpLimitSelect", function ($templateCache) {
        return {
            restrict: "A",
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || "components/dpSelect.html";
            },
            scope: {
                num: "=",
                active: "@",
                text: "@"
            },
            replace: true,
            require: "?^dpSelectGroup",
            link: function (scope, element, attrs, groupCtrl) {
                scope.type = "limit";
                scope.value = groupCtrl.format(attrs.value);
                scope.disabled = attrs.disabled == "true";
                groupCtrl.items.push(scope);
                scope.select = function () {
                    groupCtrl.setEmpty(scope);
                }
            }
        }
    })
    .run(function ($templateCache) {
        $templateCache.put("components/dpSelect.html", '<label class="condition-label" ng-class="{active:active}"  ng-click="select()" ><span class="text">{{text}}</span><span ng-if="active" class="active-icon-background"></span><span ng-if="active" class="glyphicon glyphicon-ok"></span></label>');
        $templateCache.put("components/advSettingBox/sellerFlag.html", '<label ><span ng-transclude></span></label>');
        $templateCache.put("components/advSettingBox/dpSelectHasNum.html", '<label class="condition-label" ng-class="{active:active}"  ng-click="select()" ><span class="text">{{text}}</span><span class="selectNum" ng-if="!!num ">（{{num}}）</span><span ng-if="active" class="active-icon-background"></span><span ng-if="active" class="glyphicon glyphicon-ok"></span></label>')
        $templateCache.put("components/advSettingBox/targetGroup.html", '<label class="condition-label target-group" ng-class="{active:active}"  ng-click="select()" ><span class="text">{{text}}</span><span class="selectNum" >（{{num}}）</span> <span ng-if="active" class="active-icon-background"></span><span ng-if="active" class="glyphicon glyphicon-ok"></span></label>')
    });

angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

  var $transition = function(element, trigger, options) {
    options = options || {};
    var deferred = $q.defer();
    var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

    var transitionEndHandler = function(event) {
      $rootScope.$apply(function() {
        element.unbind(endEventName, transitionEndHandler);
        deferred.resolve(element);
      });
    };

    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function() {
      if ( angular.isString(trigger) ) {
        element.addClass(trigger);
      } else if ( angular.isFunction(trigger) ) {
        trigger(element);
      } else if ( angular.isObject(trigger) ) {
        element.css(trigger);
      }
      //If browser does not support transitions, instantly resolve
      if ( !endEventName ) {
        deferred.resolve(element);
      }
    });

    // Add our custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function() {
      if ( endEventName ) {
        element.unbind(endEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
  };

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };
  function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }
  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  $transition.animationEndEventName = findEndEventName(animationEndEventNames);
  return $transition;
}]);

angular.module('ui.bootstrap.timepicker', [])
    .constant('timepickerConfig', {
        hourStep: 1,
        minuteStep: 1,
        showMeridian: true,
        meridians: null,
        readonlyInput: false,
        mousewheel: true
    })

    .controller('TimepickerController', ['$scope', '$attrs', '$parse', '$log', '$locale', 'timepickerConfig', function ($scope, $attrs, $parse, $log, $locale, timepickerConfig) {
        var selected = new Date(),
            ngModelCtrl = {$setViewValue: angular.noop}, // nullModelCtrl
            meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

        this.init = function (ngModelCtrl_, inputs) {
            ngModelCtrl = ngModelCtrl_;
            ngModelCtrl.$render = this.render;

            var hoursInputEl = inputs.eq(0),
                minutesInputEl = inputs.eq(1);

            var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;
            if (mousewheel) {
                this.setupMousewheelEvents(hoursInputEl, minutesInputEl);
            }

            $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
            this.setupInputEvents(hoursInputEl, minutesInputEl);
        };

        var hourStep = timepickerConfig.hourStep;
        if ($attrs.hourStep) {
            $scope.$parent.$watch($parse($attrs.hourStep), function (value) {
                hourStep = parseInt(value, 10);
            });
        }

        var minuteStep = timepickerConfig.minuteStep;
        if ($attrs.minuteStep) {
            $scope.$parent.$watch($parse($attrs.minuteStep), function (value) {
                minuteStep = parseInt(value, 10);
            });
        }

        // 12H / 24H mode
        $scope.showMeridian = timepickerConfig.showMeridian;
        if ($attrs.showMeridian) {
            $scope.$parent.$watch($parse($attrs.showMeridian), function (value) {
                $scope.showMeridian = !!value;

                if (ngModelCtrl.$error.time) {
                    // Evaluate from template
                    var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
                    if (angular.isDefined(hours) && angular.isDefined(minutes)) {
                        selected.setHours(hours);
                        refresh();
                    }
                } else {
                    updateTemplate();
                }
            });
        }

        // Get $scope.hours in 24H mode if valid
        function getHoursFromTemplate() {
            var hours = parseInt($scope.hours, 10);
            var valid = ( $scope.showMeridian ) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
            if (!valid) {
                return undefined;
            }

            if ($scope.showMeridian) {
                if (hours === 12) {
                    hours = 0;
                }
                if ($scope.meridian === meridians[1]) {
                    hours = hours + 12;
                }
            }
            return hours;
        }

        function getMinutesFromTemplate() {
            var minutes = parseInt($scope.minutes, 10);
            return ( minutes >= 0 && minutes < 60 ) ? minutes : undefined;
        }

        function pad(value) {
            return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
        }

        // Respond on mousewheel spin
        this.setupMousewheelEvents = function (hoursInputEl, minutesInputEl) {
            var isScrollingUp = function (e) {
                if (e.originalEvent) {
                    e = e.originalEvent;
                }
                //pick correct delta variable depending on event
                var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
                return (e.detail || delta > 0);
            };

            hoursInputEl.bind('mousewheel wheel', function (e) {
                $scope.$apply((isScrollingUp(e)) ? $scope.incrementHours() : $scope.decrementHours());
                e.preventDefault();
            });

            minutesInputEl.bind('mousewheel wheel', function (e) {
                $scope.$apply((isScrollingUp(e)) ? $scope.incrementMinutes() : $scope.decrementMinutes());
                e.preventDefault();
            });

        };

        this.setupInputEvents = function (hoursInputEl, minutesInputEl) {
            if ($scope.readonlyInput) {
                $scope.updateHours = angular.noop;
                $scope.updateMinutes = angular.noop;
                return;
            }

            var invalidate = function (invalidHours, invalidMinutes) {
                ngModelCtrl.$setViewValue(null);
                ngModelCtrl.$setValidity('time', false);
                if (angular.isDefined(invalidHours)) {
                    $scope.invalidHours = invalidHours;
                }
                if (angular.isDefined(invalidMinutes)) {
                    $scope.invalidMinutes = invalidMinutes;
                }
            };

            $scope.updateHours = function () {
                var hours = getHoursFromTemplate();

                if (angular.isDefined(hours)) {
                    selected.setHours(hours);
                    refresh('h');
                } else {
                    invalidate(true);
                }
            };

            hoursInputEl.bind('blur', function (e) {
                if (!$scope.invalidHours && $scope.hours < 10) {
                    $scope.$apply(function () {
                        $scope.hours = pad($scope.hours);
                    });
                }
            });

            $scope.updateMinutes = function () {
                var minutes = getMinutesFromTemplate();

                if (angular.isDefined(minutes)) {
                    selected.setMinutes(minutes);
                    refresh('m');
                } else {
                    invalidate(undefined, true);
                }
            };

            minutesInputEl.bind('blur', function (e) {
                if (!$scope.invalidMinutes && $scope.minutes < 10) {
                    $scope.$apply(function () {
                        $scope.minutes = pad($scope.minutes);
                    });
                }
            });

        };

        this.render = function () {
            var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;

            if (isNaN(date)) {
                ngModelCtrl.$setValidity('time', false);
                $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
            } else {
                if (date) {
                    selected = date;
                }
                makeValid();
                updateTemplate();
            }
        };

        // Call internally when we know that model is valid.
        function refresh(keyboardChange) {
            makeValid();
            ngModelCtrl.$setViewValue(new Date(selected));
            updateTemplate(keyboardChange);
        }

        function makeValid() {
            ngModelCtrl.$setValidity('time', true);
            $scope.invalidHours = false;
            $scope.invalidMinutes = false;
        }

        function updateTemplate(keyboardChange) {
            var hours = selected.getHours(), minutes = selected.getMinutes();

            if ($scope.showMeridian) {
                hours = ( hours === 0 || hours === 12 ) ? 12 : hours % 12; // Convert 24 to 12 hour system
            }

            $scope.hours = keyboardChange === 'h' ? hours : pad(hours);
            $scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
            $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
        }

        function addMinutes(minutes) {
            var dt = new Date(selected.getTime() + minutes * 60000);
            selected.setHours(dt.getHours(), dt.getMinutes());
            refresh();
        }

        $scope.incrementHours = function () {
            addMinutes(hourStep * 60);
        };
        $scope.decrementHours = function () {
            addMinutes(-hourStep * 60);
        };
        $scope.incrementMinutes = function () {
            addMinutes(minuteStep);
        };
        $scope.decrementMinutes = function () {
            addMinutes(-minuteStep);
        };
        $scope.toggleMeridian = function () {
            addMinutes(12 * 60 * (( selected.getHours() < 12 ) ? 1 : -1));
        };
    }])

    .directive('timepicker', function () {
        return {
            restrict: 'EA',
            require: ['timepicker', '?^ngModel'],
            controller: 'TimepickerController',
            replace: true,
            scope: {},
            templateUrl: COMMON_SOURCE_PATH + 'views/timepicker/timepicker.html',
            link: function (scope, element, attrs, ctrls) {
                var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if (ngModelCtrl) {
                    timepickerCtrl.init(ngModelCtrl, element.find('input'));
                }
            }
        };
    });

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module('ui.bootstrap.tooltip', ['ui.bootstrap.position', 'ui.bootstrap.bindHtml'])

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
    .provider('$tooltip', function () {
        // The default options tooltip and popover.
        var defaultOptions = {
            placement: 'top',
            animation: true,
            popupDelay: 0
        };

        // Default hide triggers for each show trigger
        var triggerMap = {
            'mouseenter': 'mouseleave',
            'click': 'click',
            'focus': 'blur'
        };

        // The options specified to the provider globally.
        var globalOptions = {};

        /**
         * `options({})` allows global configuration of all tooltips in the
         * application.
         *
         *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
         */
        this.options = function (value) {
            angular.extend(globalOptions, value);
        };

        /**
         * This allows you to extend the set of trigger mappings available. E.g.:
         *
         *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
         */
        this.setTriggers = function setTriggers(triggers) {
            angular.extend(triggerMap, triggers);
        };

        /**
         * This is a helper function for translating camel-case to snake-case.
         */
        function snake_case(name) {
            var regexp = /[A-Z]/g;
            var separator = '-';
            return name.replace(regexp, function (letter, pos) {
                return (pos ? separator : '') + letter.toLowerCase();
            });
        }

        /**
         * Returns the actual instance of the $tooltip service.
         * TODO support multiple triggers
         */
        this.$get = ['$window', '$compile', '$timeout', '$document', '$position', '$interpolate', function ($window, $compile, $timeout, $document, $position, $interpolate) {
            return function $tooltip(type, prefix, defaultTriggerShow) {
                var options = angular.extend({}, defaultOptions, globalOptions);

                /**
                 * Returns an object of show and hide triggers.
                 *
                 * If a trigger is supplied,
                 * it is used to show the tooltip; otherwise, it will use the `trigger`
                 * option passed to the `$tooltipProvider.options` method; else it will
                 * default to the trigger supplied to this directive factory.
                 *
                 * The hide trigger is based on the show trigger. If the `trigger` option
                 * was passed to the `$tooltipProvider.options` method, it will use the
                 * mapped trigger from `triggerMap` or the passed trigger if the map is
                 * undefined; otherwise, it uses the `triggerMap` value of the show
                 * trigger; else it will just use the show trigger.
                 */
                function getTriggers(trigger) {
                    var show = trigger || options.trigger || defaultTriggerShow;
                    var hide = triggerMap[show] || show;
                    return {
                        show: show,
                        hide: hide
                    };
                }

                var directiveName = snake_case(type);

                var startSym = $interpolate.startSymbol();
                var endSym = $interpolate.endSymbol();
                var template =
                    '<div ' + directiveName + '-popup ' +
                    'title="' + startSym + 'title' + endSym + '" ' +
                    'content="' + startSym + 'content' + endSym + '" ' +
                    'placement="' + startSym + 'placement' + endSym + '" ' +
                    'animation="animation" ' +
                    'is-open="isOpen"' +
                    '>' +
                    '</div>';

                return {
                    restrict: 'EA',
                    compile: function (tElem, tAttrs) {
                        var tooltipLinker = $compile(template);

                        return function link(scope, element, attrs) {
                            var tooltip;
                            var tooltipLinkedScope;
                            var transitionTimeout;
                            var popupTimeout;
                            var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
                            var triggers = getTriggers(undefined);
                            var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);
                            var ttScope = scope.$new(true);

                            var positionTooltip = function () {

                                var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
                                ttPosition.top += 'px';
                                ttPosition.left += 'px';

                                // Now set the calculated positioning.
                                tooltip.css(ttPosition);
                            };

                            // By default, the tooltip is not open.
                            // TODO add ability to start tooltip opened
                            ttScope.isOpen = false;

                            function toggleTooltipBind() {
                                if (!ttScope.isOpen) {
                                    showTooltipBind();
                                } else {
                                    hideTooltipBind();
                                }
                            }

                            // Show the tooltip with delay if specified, otherwise show it immediately
                            function showTooltipBind() {
                                if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {
                                    return;
                                }

                                prepareTooltip();

                                if (ttScope.popupDelay) {
                                    // Do nothing if the tooltip was already scheduled to pop-up.
                                    // This happens if show is triggered multiple times before any hide is triggered.
                                    if (!popupTimeout) {
                                        popupTimeout = $timeout(show, ttScope.popupDelay, false);
                                        popupTimeout.then(function (reposition) {
                                            reposition();
                                        });
                                    }
                                } else {
                                    show()();
                                }
                            }

                            function hideTooltipBind() {
                                scope.$apply(function () {
                                    hide();
                                });
                            }

                            // Show the tooltip popup element.
                            function show() {

                                popupTimeout = null;

                                // If there is a pending remove transition, we must cancel it, lest the
                                // tooltip be mysteriously removed.
                                if (transitionTimeout) {
                                    $timeout.cancel(transitionTimeout);
                                    transitionTimeout = null;
                                }

                                // Don't show empty tooltips.
                                if (!ttScope.content) {
                                    return angular.noop;
                                }

                                createTooltip();

                                // Set the initial positioning.
                                tooltip.css({
                                    top: 0,
                                    left: 0,
                                    display: 'block'
                                });
                                ttScope.$digest();

                                positionTooltip();

                                // And show the tooltip.
                                ttScope.isOpen = true;
                                ttScope.$digest(); // digest required as $apply is not called

                                // Return positioning function as promise callback for correct
                                // positioning after draw.
                                return positionTooltip;
                            }

                            // Hide the tooltip popup element.
                            function hide() {
                                // First things first: we don't show it anymore.
                                ttScope.isOpen = false;

                                //if tooltip is going to be shown after delay, we must cancel this
                                $timeout.cancel(popupTimeout);
                                popupTimeout = null;

                                // And now we remove it from the DOM. However, if we have animation, we
                                // need to wait for it to expire beforehand.
                                // FIXME: this is a placeholder for a port of the transitions library.
                                if (ttScope.animation) {
                                    if (!transitionTimeout) {
                                        transitionTimeout = $timeout(removeTooltip, 500);
                                    }
                                } else {
                                    removeTooltip();
                                }
                            }

                            function createTooltip() {
                                // There can only be one tooltip element per directive shown at once.
                                if (tooltip) {
                                    removeTooltip();
                                }
                                tooltipLinkedScope = ttScope.$new();
                                tooltip = tooltipLinker(tooltipLinkedScope, function (tooltip) {
                                    if (appendToBody) {
                                        $document.find('body').append(tooltip);
                                    } else {
                                        element.after(tooltip);
                                    }
                                });
                            }

                            function removeTooltip() {
                                transitionTimeout = null;
                                if (tooltip) {
                                    tooltip.remove();
                                    tooltip = null;
                                }
                                if (tooltipLinkedScope) {
                                    tooltipLinkedScope.$destroy();
                                    tooltipLinkedScope = null;
                                }
                            }

                            function prepareTooltip() {
                                prepPlacement();
                                prepPopupDelay();
                            }

                            /**
                             * Observe the relevant attributes.
                             */
                            attrs.$observe(type, function (val) {
                                ttScope.content = val;

                                if (!val && ttScope.isOpen) {
                                    hide();
                                }
                            });

                            attrs.$observe(prefix + 'Title', function (val) {
                                ttScope.title = val;
                            });

                            function prepPlacement() {
                                var val = attrs[prefix + 'Placement'];
                                ttScope.placement = angular.isDefined(val) ? val : options.placement;
                            }

                            function prepPopupDelay() {
                                var val = attrs[prefix + 'PopupDelay'];
                                var delay = parseInt(val, 10);
                                ttScope.popupDelay = !isNaN(delay) ? delay : options.popupDelay;
                            }

                            var unregisterTriggers = function () {
                                element.unbind(triggers.show, showTooltipBind);
                                element.unbind(triggers.hide, hideTooltipBind);
                            };

                            function prepTriggers() {
                                var val = attrs[prefix + 'Trigger'];
                                unregisterTriggers();

                                triggers = getTriggers(val);

                                if (triggers.show === triggers.hide) {
                                    element.bind(triggers.show, toggleTooltipBind);
                                } else {
                                    element.bind(triggers.show, showTooltipBind);
                                    element.bind(triggers.hide, hideTooltipBind);
                                }
                            }

                            prepTriggers();

                            var animation = scope.$eval(attrs[prefix + 'Animation']);
                            ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;

                            var appendToBodyVal = scope.$eval(attrs[prefix + 'AppendToBody']);
                            appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;

                            // if a tooltip is attached to <body> we need to remove it on
                            // location change as its parent scope will probably not be destroyed
                            // by the change.
                            if (appendToBody) {
                                scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess() {
                                    if (ttScope.isOpen) {
                                        hide();
                                    }
                                });
                            }

                            // Make sure tooltip is destroyed and removed.
                            scope.$on('$destroy', function onDestroyTooltip() {
                                $timeout.cancel(transitionTimeout);
                                $timeout.cancel(popupTimeout);
                                unregisterTriggers();
                                removeTooltip();
                                ttScope = null;
                            });
                        };
                    }
                };
            };
        }];
    })

    .directive('tooltipPopup', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                content: '@',
                placement: '@',
                animation: '&',
                isOpen: '&'
            },
            templateUrl: COMMON_SOURCE_PATH + 'views/tooltip/tooltip-popup.html'
        };
    })

    .directive('tooltip', ['$tooltip', function ($tooltip) {
        return $tooltip('tooltip', 'tooltip', 'mouseenter');
    }])

    .directive('tooltipHtmlUnsafePopup', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                content: '@',
                placement: '@',
                animation: '&',
                isOpen: '&'
            },
            templateUrl: COMMON_SOURCE_PATH + 'views/tooltip/tooltip-html-unsafe-popup.html'
        };
    })

    .directive('tooltipHtmlUnsafe', ['$tooltip', function ($tooltip) {
        return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
    }]);



angular.module("dp.ui.fileupload", [])
    //文件选择框
    .controller('fileModalCtrl', ['$scope', '$modalInstance', '$data', '$restClient', '$win', '$q', "$timeout",
        function($scope, $modalInstance, $data, $restClient, $win, $q, $timeout) {
            //分页相关
            $scope.pageNo = 1;
            $scope.pageSize = 5;
            $scope.count = 0;
            //文件相关
            $scope.fileType = $data.fileType;
            //内容类型
            $scope.contentType = $data.contentType;

            if ($data.downloadUrl && $data.downloadUrl[0] != "/") {
                $data.downloadUrl = "/" + $data.downloadUrl;
            }

            $scope.downloadUrl = $data.downloadUrl;
            //当前文件
            $scope.file = $data.file;
            $scope.select = $scope.file.id;

            //取消
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };

            //保存
            $scope.save = function() {
                if (!$scope.select) {
                    $win.alert("请选择文件");
                    return false;
                }

                $modalInstance.close(angular.copy($scope.file));
            };

            //获取列表
            $scope.getList = getList;

            $scope.reset = function() {
                $scope.name = "";
                $scope.startTime = null;
                $scope.endTime = null;
            }

            //下载模板
            $scope.downloadTemplate = function(ele, strUrl) {
                var form = $("<form>"); //定义一个form表单
                form.attr('style', 'display:none'); //在form表单中添加查询参数
                form.attr('target', '');
                form.attr('method', 'get');
                form.attr('action', $scope.downloadUrl);
                var params = getParamFormUrl($scope.downloadUrl);
                if (params.length > 0) {
                    angular.forEach(params, function(param) {
                        var input1 = $('<input>');
                        input1.attr('type', 'hidden');
                        input1.attr('name', param.key);
                        input1.attr('value', param.value);
                        form.append(input1);
                    })
                }
                $('body').append(form); //将表单放置在web中
                form.submit();
                setTimeout(function() {
                    form.remove();
                }, 300);
            };

            function getParamFormUrl(url) {
                var search = url.split('?');
                var params = [];
                if (search.length <= 1) {
                    return [];
                }
                search = search[1];
                var paramArray = search.split("&");
                $(paramArray).each(function(i, item) {
                    var data = item.split("=");
                    params.push({
                        key: data[0],
                        value: data[1]
                    });
                });
                return params;
            }

            //上传文件
            $scope.uploadFile = function() {

                $scope.uploading = upload().then(function(reuslt) {
                    var deferred = $q.defer();

                    $restClient.get("seller/uploadFile", { uploadFileId: reuslt.id }, function(data) {
                        $scope.file = data.data;
                        $scope.select = $scope.file.id;
                        //$win.alertSuccess("成功" + (reuslt.successNumber || 0) + ";失败" + (reuslt.failedNumber || 0) + ";总数" + (reuslt.totalNumber || 0), $scope);
                        $win.alertSuccess("文件上传成功，可从列表中选择此文档点击确定使用！");  
                        getList(1);
                    }, deferred);

                    return deferred.promise;
                })

            };


            function upload() {
                var deferred = $q.defer();
                var action = {
                    successCallback: function(data) {
                        deferred.resolve(data.data)
                    },
                    failCallback: function(data) {
                        $win.alert(data.resultMessage);
                        // $win.confirm({
                        //     img: "images/components/alert/alert-forbid.png",
                        //     title: "错误提示",
                        //     content: data.resultMessage
                        // });
                    }
                };
                $restClient.postFormData("seller/uploadFile", {
                    contentType: $scope.contentType,
                    fileType: $scope.fileType,
                    file: $scope.fileDocument
                }, action, deferred, null, "file");
                return deferred.promise;
            }

            //选择文件
            $scope.selectFile = function(file) {
                $scope.file = file;
                $scope.select = file.id;
            };

            //删除文件
            $scope.deleteFile = function(file) {
                var instance = $win.confirm({
                    img: "images/components/alert/alert-delete.png",
                    title: "您确定要删除吗？",
                    content: "删除后将无法恢复，请慎重操作！",
                    windowTitle: "系统提示"
                });

                instance.result.then(function() {
                    var action = {
                        successCallback: function(data) {
                            getList($scope.pageNo);
                        },
                        failCallback: function(data) {
                            $win.alert('操作失败');
                        }
                    };
                    $scope.loading = $restClient.deletes('seller/uploadFile', {
                        uploadFileId: file.id
                    }, action).$promise;
                });
            };

            init();

            function init() {
                getList(1);
            }

            //获取文件列表
            function getList(pageNo, pageSize, total) {
                if (!validate()) {
                    return false;
                }
                var params = {
                    name: $scope.name,
                    startTime: $scope.startTime && moment($scope.startTime).format("YYYY/MM/DD HH:mm:ss"),
                    endTime: $scope.endTime && moment($scope.endTime).format("YYYY/MM/DD HH:mm:ss"),
                    pageNo: --pageNo,
                    pageSize: pageSize || $scope.pageSize,
                    fileType: $scope.fileType,
                    contentType: $scope.contentType
                };
                var action = {
                    successCallback: function(data) {
                        $scope.list = data.data;
                        $scope.pageNo = ++data.pageNo;
                        $scope.pageSize = data.pageSize;
                        $scope.count = data.count;
                    }
                };
                $scope.loading = $restClient.post("seller/uploadFile/search", null, params, action).$promise;
            }


            function validate() {
                if ($scope.startTime && $scope.endTime && moment($scope.startTime).diff(moment($scope.endTime)) > 0) {
                    $win.alert("结束时间不能小于开始时间");
                    return false;
                }

                return true;
            }
        }
    ])
    //监测选择文件变化
    .directive('fileChange', [function() {
        return {
            restrict: 'AE',
            scope: {
                onChange: '&fileChange'
            },
            link: function($scope, element, attrs) {
                $(element).on("change", function() {
                    $scope.onChange();
                });
            }
        }
    }]);

angular.module("dp.ui.fileupload")
    .directive("dpFileSelect", ["$modal", function($modal) {
        var DEFAULTS = {
            fileType:null,
            contentType: null,
            downloadUrl: "",
            showDownload: true
        };

        return {
            restrict: "EA",
            templateUrl: COMMON_SOURCE_PATH + "views/upload/fileSelect.html",
            scope: {
                data: "=dpFileSelect",
                completedAction: "&",
                options: "="
            },
            controller: function($scope, $element, $attrs) {

                init();

                function init() {
                    $scope.data=$scope.data||{};
                    $scope.options = getOptions();
                    if (!$scope.options.fileType) {
                        throw new Error("上传文件需要类型");
                    }

                    if ($scope.options.showDownload && !$scope.options.downloadUrl) {
                        throw new Error("文件选择控件需要配置下载路径");
                    }
                }

                function getOptions() {
                    return $.extend({}, DEFAULTS, $scope.options || {});
                }

                $scope.downloadTmpl = function() {

                    if ($scope.options.downloadUrl && $scope.options.downloadUrl[0] != "/") {
                        $scope.options.downloadUrl = "/" + $scope.options.downloadUrl;
                    }

                    var form = $("<form>"); //定义一个form表单
                    form.attr('style', 'display:none'); //在form表单中添加查询参数
                    form.attr('target', '');
                    form.attr('method', 'get');
                    form.attr('action', $scope.options.downloadUrl);

                    var params = getParamFormUrl($scope.options.downloadUrl);
                    if (params.length > 0) {
                        angular.forEach(params, function(param) {
                            var input1 = $('<input>');
                            input1.attr('type', 'hidden');
                            input1.attr('name', param.key);
                            input1.attr('value', param.value);
                            form.append(input1);
                        })
                    }
                    $('body').append(form); //将表单放置在web中
                    form.submit();
                    setTimeout(function() {
                        form.remove();
                    }, 300);
                };

                function getParamFormUrl(url) {
                    var search = url.split('?');
                    var params = [];
                    if (search.length <= 1) {
                        return [];
                    }
                    search = search[1];
                    var paramArray = search.split("&");
                    $(paramArray).each(function(i, item) {
                        var data = item.split("=");
                        params.push({
                            key: data[0],
                            value: data[1]
                        });
                    });
                    return params;
                }

                $scope.selectFile = function() {
                    var modalInstance = $modal.open({
                        templateUrl: COMMON_SOURCE_PATH + 'views/upload/fileModal.html',
                        controller: 'fileModalCtrl',
                        windowClass: "file-select-modal",
                        resolve: {
                            $data: function() {
                                return {
                                    file: $scope.data && {
                                        id: $scope.data.id,
                                        name: $scope.data.name
                                    },
                                    fileType:$scope.options.fileType,
                                    contentType: $scope.options.contentType,
                                    downloadUrl: $scope.options.downloadUrl
                                }
                            }
                        },
                        size: 'lg'
                    });

                    modalInstance.result.then(function(result) {
                        $scope.data.id = result.id;
                        $scope.data.name = result.name;
                        $scope.completedAction && $scope.completedAction({
                            file: result
                        })
                    });
                }
            }
        }
    }])
angular.module("dp.ui.fileupload")
    .directive("dpFileupload", [function($scope) {
        function link(scope, element, attrs, ctrl) {
            var files,
                options = scope.options = getOptions(),
                $inputFile = element.find(options.multiple ? ".file-input-multiple" : ".file-input-single").eq(0), //上传控件
                $filePreview = element.find(".fileupload-preview").eq(0); //预览区域

            $filePreview.on("click", "button.close", function() {
                var name = $.trim($(this).siblings(".file-name").text());
                if (files && files.length) {
                    files = $.map(files, function(file, i) {
                        return file.name == name ? undefined : file;
                    });
                    ctrl.$setViewValue(options.multiple ? files : files[0]);
                    setPreview(files);
                } else {
                    scope.clear();
                }

                scope.$apply();
            });

            $inputFile.on("change", function() {
                files = $.map($inputFile.get(0).files, function(file) {
                    return file
                });
                if (files.length) {
                    var result = options.multiple ? files : files[0];
                    scope.hasFile = true;
                    scope.btnName = "重新选择";
                    //设置viewValue
                    ctrl.$setViewValue(result);
                    //显示预览
                    scope.options.isImg ? setImgPreview(files) : setPreview(files);
                    scope.showBtnClear = true;
                    //change动作
                    var promise = scope.submitLoading = scope.changedAction({ data: result });

                    scope.options.autoClear && scope.clear();
                }
                scope.$apply();
            });

            scope.clear = function() {
                scope.btnName = "选择文件";
                $inputFile.val("");
                ctrl.$setViewValue("");
                $filePreview.text("");
                scope.showBtnClear = false;
            };

            ctrl.$render = function() {
                ctrl.$viewValue && (scope.options.isImg ? setImgPreview(ctrl.$viewValue) : setPreview(ctrl.$viewValue));
            };

            init();

            function init() {
                scope.btnName = "选择文件";
                scope.showBtnClear = false;
            }

            function setPreview(data) {
                if (data.length) {
                    var html = data.length ? $.map(data, function(item) {
                        return getFileNode(item);
                    }) : getFileNode(item);
                    $filePreview.html(html);
                } else {
                    scope.clear();
                }
            }

            function setImgPreview(data) {
                if (data.length) {
                    $filePreview.attr("src", typeof data == "string" ? data : window.URL.createObjectURL(data[0]));
                }
            }

            function getFileNode(data) {
                var html = options.multiple ? '<span class="file" >' +
                    '<span class="file-name">{{name}}</span>' +
                    '<button class="close"><span>×</span></button ng-click="remove();">' +
                    '</span>' : '<span>{{name}}</span>';
                return html.replace(/\{\{name\}\}/ig, data.name);
            }

            function getOptions() {
                var options = {};
                options.multiple = !!attrs.multiple;
                options.autoClear = String(attrs.autoClear).toLowerCase() == "true";
                options.isImg = (attrs.type && attrs.type.toLowerCase().indexOf("img") > -1);
                return options;
            }
        }

        return {
            restrict: "EA",
            require: "ngModel",
            templateUrl: function($element, $attrs) {
                return COMMON_SOURCE_PATH + "views/upload/" + ($attrs.type || "fileUpload") + ".html";
            },
            scope: {
                changedAction: "&"
            },
            link: link
        }
    }]);

angular.module("dp.ui.fileupload")
    .directive('dpImgUpload', ["$restClient", "$win", "$q", "$timeout",
        function($restClient, $win, $q, $timeout) {
            return {
                restrict: "EA",
                templateUrl: COMMON_SOURCE_PATH + "views/upload/imgUpload.html",
                scope: {
                    imgUrl: "=dpImgUpload",
                    options: "=",
                    completedAction: "&"
                },
                //replace: true,
                link: function(scope, element, attr) {
                    var $upload = element.find(".no-img .file-upload").eq(0);
                    var $uploadHasImg = element.find(".has-img .file-upload").eq(0);
                    var $form = element.find(".no-img .ajax-form").eq(0);
                    var $formHasImg = element.find(".has-img .ajax-form").eq(0);
                    //上传文件
                    scope.uploadFile = function() {
                        var deferred = $q.defer();
                        var options = {
                            url: scope.options.url,
                            data: scope.options.data,
                            type: "POST",
                            resetForm: true, // 成功提交后，重置元素的值
                            enctype: "multipart/form-data",
                            success: function(data) {
                                if (data.resultCode == 0) {
                                    deferred.resolve();
                                    scope.imgUrl = data.data;
                                    scope.hasImg = true;
                                    scope.completedAction({
                                        result: data.data
                                    });
                                    $win.alertSuccess("上传成功");
                                } else {
                                    deferred.reject();
                                    $win.alert(data.resultMessage, scope);
                                }
                            }, // 提交后的回调函数
                            error: function() {
                                deferred.reject();
                            }
                        };
                        scope.uploading = deferred.promise;
                        (scope.hasImg ? $formHasImg : $form)["ajaxSubmit"](options);
                        scope.$apply();
                    };

                    init();

                    function init() {
                        scope.$watch("imgUrl", function(newValue) {
                            if (newValue) {
                                scope.hasImg = true;
                            }
                        });

                    }
                }
            }
        }
    ]);
angular.module("dp.ui.validate", [])
    .factory("dpRegexp", [function () {
        /*验证数字：^[0-9]*$
         验证n位的数字：^\d{n}$
         验证至少n位数字：^\d{n,}$
         验证m-n位的数字：^\d{m,n}$
         验证零和非零开头的数字：^(0|[1-9][0-9]*)$
         验证有两位小数的正实数：^[0-9]+(.[0-9]{2})?$
         验证有1-3位小数的正实数：^[0-9]+(.[0-9]{1,3})?$
         验证非零的正整数：^\+?[1-9][0-9]*$
         验证非零的负整数：^\-[1-9][0-9]*$
         验证非负整数（正整数 + 0） ^\d+$
         验证非正整数（负整数 + 0） ^((-\d+)|(0+))$
         验证长度为3的字符：^.{3}$
         验证由26个英文字母组成的字符串：^[A-Za-z]+$
         验证由26个大写英文字母组成的字符串：^[A-Z]+$
         验证由26个小写英文字母组成的字符串：^[a-z]+$
         验证由数字和26个英文字母组成的字符串：^[A-Za-z0-9]+$
         验证由数字、26个英文字母或者下划线组成的字符串：^\w+$
         验证用户密码:^[a-zA-Z]\w{5,17}$ 正确格式为：以字母开头，长度在6-18之间，只能包含字符、数字和下划线。
         验证是否含有 ^%&',;=?$\" 等字符：[^%&',;=?$\x22]+
         验证汉字：^[\u4e00-\u9fa5],{0,}$
         验证Email地址：^\w+[-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$
         验证InternetURL：^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$ ；^[a-zA-z]+://(w+(-w+)*)(.(w+(-w+)*))*(?S*)?$
         验证电话号码：^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$：--正确格式为：XXXX-XXXXXXX，XXXX-XXXXXXXX，XXX-XXXXXXX，XXX-XXXXXXXX，XXXXXXX，XXXXXXXX。
         验证身份证号（15位或18位数字）：^\d{15}|\d{}18$
         验证一年的12个月：^(0?[1-9]|1[0-2])$ 正确格式为：“01”-“09”和“1”“12”
         验证一个月的31天：^((0?[1-9])|((1|2)[0-9])|30|31)$ 正确格式为：01、09和1、31。
         整数：^-?\d+$
         非负浮点数（正浮点数 + 0）：^\d+(\.\d+)?$
         正浮点数 ^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$
         非正浮点数（负浮点数 + 0） ^((-\d+(\.\d+)?)|(0+(\.0+)?))$
         负浮点数 ^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$
         浮点数 ^(-?\d+)(\.\d+)?$
         手机号码 ^1[0-9]{10}$
         */

    }])
    .directive("dpValidRemoteValid", ["$restClient", "$timeout",
        function ($restClient, $timeout) {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {
                    scope.$watch(attrs.ngModel, function () {
                        $restClient.get(attrs.url, {
                            name: encodeURI(ctrl.$viewValue)
                        }, function (data) {
                            if (!!data.data)
                                ctrl.$setValidity('remote', true);
                            else
                                ctrl.$setValidity('remote', false);

                        }, function (data) {
                            ctrl.$setValidity('remote', true);
                        });
                    })
                }
            }
        }
    ])
    //是否为数字
    .directive("dpValidIsNumber", [function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var validate = function (viewValue) {
                    if (!viewValue) {
                        ctrl.$setValidity('dpValidIsNumber', true);
                        return viewValue;
                    }

                    ctrl.$setValidity('dpValidIsNumber', $.isNumeric(viewValue));

                    return viewValue;
                };

                ctrl.$parsers.unshift(validate);
                ctrl.$formatters.push(validate);
            }
        }
    }])
    //最小值 compareType：比较类型;mixValue：最小值
    .directive("dpValidMin", [function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var validate = function (viewValue) {
                    var compareType = attrs.compareType ? attrs.compareType.toLowerCase() : "";
                    var isDate = compareType.indexOf('datetime') > -1;
                    var minValue = isDate ? moment(attrs.dpValidMin) : parseFloat(attrs.dpValidMin);

                    if (!viewValue) {
                        ctrl.$setValidity('dpValidMin', true);
                        return viewValue;
                    }

                    if (isDate) {
                        ctrl.$setValidity('dpValidMin', moment(viewValue).diff(minValue) >= 0);
                    }
                    else {
                        ctrl.$setValidity('dpValidMin', parseFloat(viewValue) >= minValue);
                    }

                    return viewValue;
                };

                ctrl.$parsers.unshift(validate);
                ctrl.$formatters.push(validate);
            }
        }
    }])
    //最大值 compareType：比较类型,maxValue：最大值
    .directive("dpValidMax", [function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var validate = function (viewValue) {
                    var compareType = attrs.compareType ? attrs.compareType.toLowerCase() : "";
                    var isDate = compareType.indexOf('datetime') > -1;
                    var maxValue = isDate ? moment(attrs.dpValidMax) : parseFloat(attrs.dpValidMax);

                    if (!viewValue) {
                        ctrl.$setValidity('dpValidMax', true);
                        return viewValue;
                    }
                    if (isDate) {
                        ctrl.$setValidity('dpValidMax', moment(viewValue).diff(maxValue) <= 0);
                    } else {
                        ctrl.$setValidity('dpValidMax', parseFloat(viewValue) <= maxValue);
                    }

                    return viewValue;
                };

                ctrl.$parsers.unshift(validate);
                ctrl.$formatters.push(validate);
            }
        }
    }])
    //必须小于某个依赖 compareType:比较类型
    .directive('dpValidLowerThan', [
        function () {
            var link = function ($scope, $element, $attrs, ctrl) {
                var validate = function (viewValue) {
                    var isDateTime = $attrs.compareType && $attrs.compareType.toLowerCase().indexOf('datetime') > -1;
                    var comparisonModel = $attrs.dpValidLowerThan.replace(/"/g, '');

                    if (!viewValue || !comparisonModel) {
                        ctrl.$setValidity('dpValidLowerThan', true);
                        return viewValue;
                    }

                    if (isDateTime) {
                        var startTime = moment(comparisonModel)._d.getTime();
                        var endTime = moment(viewValue)._d.getTime();

                        ctrl.$setValidity('dpValidLowerThan', parseInt(endTime, 10) <= parseInt(startTime, 10));
                    } else {
                        ctrl.$setValidity('dpValidLowerThan', parseFloat(viewValue) <= parseFloat(comparisonModel));
                    }

                    return viewValue;
                };

                ctrl.$parsers.unshift(validate);
                ctrl.$formatters.push(validate);

                $attrs.$observe('dpValidLowerThan', function () {
                    return validate(ctrl.$viewValue);
                });
            };
            return {
                require: 'ngModel',
                link: link
            };
        }
    ])
    //不是全英文
    .directive("dpNotAllEnglish", [
        function () {
            var link = function ($scope, $element, $attrs, ctrl) {
                var validate = function (viewValue) {
                    var reg=new RegExp(/^[a-zA-Z]+$/);

                    if (!viewValue) {
                        ctrl.$setValidity('dpNotAllEnglish', true);
                        return viewValue;
                    }
                    ctrl.$setValidity('dpNotAllEnglish',!reg.test(viewValue));

                    return viewValue;
                };
                ctrl.$parsers.unshift(validate);
                ctrl.$formatters.push(validate);
            };
            return {
                require: 'ngModel',
                link: link
            };
        }
    ]);



angular.module("w5c.validator", ["ng"])
    .provider('w5cValidator', [function () {
        var defaultRules = {
                required: "该选项不能为空",
                maxlength: "该选项输入值长度不能大于{maxlength}",
                minlength: "该选项输入值长度不能小于{minlength}",
                email: "输入邮件的格式不正确",
                repeat: "两次输入不一致",
                pattern: "该选项输入格式不正确",
                number: "必须输入数字",
                w5cuniquecheck: "该输入值已经存在，请重新输入",
                url: "输入URL格式不正确",
                max: "该选项输入值不能大于{max}",
                min: "该选项输入值不能小于{min}",
                customizer: "自定义验证不通过"
            },
            elemTypes = ['text', 'password', 'email', 'number', 'url', 'tel', 'hidden', ['textarea'], ['select'], ['select-multiple'], ['select-one'], 'radio', 'checkbox'];

        var getParentGroup = function (elem) {
            if (elem[0].tagName === "FORM" || elem[0].nodeType == 11) {
                return null;
            }
            if (elem && elem.hasClass("form-group")) {
                return elem;
            } else {
                return getParentGroup(elem.parent())
            }
        };

        var validatorFn = function () {
            this.elemTypes = elemTypes;
            this.rules = {};
            this.isEmpty = function (object) {
                if (!object) {
                    return true;
                }
                if (object instanceof Array && object.length === 0) {
                    return true;
                }
                return false;
            };
            this.defaultShowError = function (elem, errorMessages) {
                var $elem = angular.element(elem),
                    $group = getParentGroup($elem),
                    $parent = $elem.parent();

                if (!this.isEmpty($group) && !$group.hasClass("has-error")) {
                    $group.addClass("has-error");

                }
                var isInputGroup = $parent.hasClass("input-group");
                var $next = isInputGroup ? $parent.next() : $elem.next();

                if (!$next || !$next.hasClass("w5c-error")) {
                    (isInputGroup ? $parent : $elem)["after"]('<span class="w5c-error">' + errorMessages[0] + '</span>');
                }
            };
            this.defaultRemoveError = function (elem) {
                var $elem = angular.element(elem),
                    $group = getParentGroup($elem),
                    $parent = $elem.parent();

                if (!this.isEmpty($group) && $group.hasClass("has-error")) {
                    $group.removeClass("has-error");
                }

                var isInputGroup = $parent.hasClass("input-group");
                var $next = isInputGroup ? $parent.next() : $elem.next();
                if ($next.hasClass && $next.hasClass("w5c-error")) {
                    $next.remove();
                }
            };
            this.options = {
                blurTrig: false,
                showError: true,
                removeError: true
            }
        };

        validatorFn.prototype = {
            constructor: validatorFn,
            config: function (options) {
                this.options = angular.extend(this.options, options);
            },
            setRules: function (rules) {
                this.rules = angular.extend(this.rules, rules);
            },
            getErrorMessage: function (validationName, elem) {
                var msgTpl = null, elementName = elem.name;
                if (elementName && /\$\d+\$/i.test(elementName)) {
                    elementName = elementName.replace(/\$\d+\$/i, '');
                }
                if (!this.isEmpty(this.rules[elementName]) && !this.isEmpty(this.rules[elementName][validationName])) {
                    msgTpl = this.rules[elementName][validationName];
                }

                switch (validationName) {
                    case "maxlength":
                        return (msgTpl || defaultRules.maxlength).replace("{maxlength}", elem.getAttribute("ng-maxlength"));
                        break;
                    case "minlength":
                        return (msgTpl || defaultRules.minlength).replace("{minlength}", elem.getAttribute("ng-minlength"));
                        break;
                    case "max":
                        return (msgTpl || defaultRules.max).replace("{max}", elem.getAttribute("max"));
                        break;
                    case "min":
                        return (msgTpl || defaultRules.min).replace("{min}", elem.getAttribute("min"));
                    default :
                    {
                        if (msgTpl !== null) {
                            return msgTpl;
                        }
                        if (defaultRules[validationName] === null) {
                            throw new Error("该验证规则(" + validationName + ")默认错误信息没有设置！");
                        }
                        return defaultRules[validationName];
                    }

                }
            },
            getErrorMessages: function (elem, errors) {
                var elementErrors = [];
                for (var err in errors) {
                    if (errors[err]) {
                        var msg = this.getErrorMessage(err, elem);
                        elementErrors.push(msg);
                    }
                }
                return elementErrors;
            },
            showError: function (elem, errorMessages, options) {
                var useOptions = angular.extend({}, this.options, options);
                angular.element(elem).removeClass("valid").addClass("error");
                if (useOptions.showError === false) {
                    return;
                }
                if (angular.isFunction(useOptions.showError)) {
                    return useOptions.showError(elem, errorMessages);
                }
                if (useOptions.showError === true) {
                    return this.defaultShowError(elem, errorMessages);
                }
            },
            removeError: function (elem, options) {
                var useOptions = angular.extend({}, this.options, options);
                angular.element(elem).removeClass("error").addClass("valid");
                if (useOptions.removeError === false) {
                    return;
                }
                if (angular.isFunction(useOptions.removeError)) {
                    return useOptions.removeError(elem);
                }
                if (useOptions.removeError === true) {
                    return this.defaultRemoveError(elem);
                }
            }
        };

        var validator = new validatorFn();

        /**
         * 配置验证属性
         * @param options
         */
        this.config = function (options) {
            validator.config(options);
        };

        /**
         * 设置验证规则，提示信息
         * @param rules
         */
        this.setRules = function (rules) {
            validator.setRules(rules);
        };

        /**
         * 设置默认规则
         * @param rules
         */
        this.setDefaultRules = function (rules) {
            defaultRules = angular.extend(defaultRules, rules);
        };

        /**
         * get method
         * @returns {validatorFn}
         */
        this.$get = function () {
            return validator;
        }
    }]);

(function () {
    angular.module("w5c.validator")
        .directive("w5cFormValidate", [
            '$parse', 'w5cValidator', '$timeout',
            function ($parse, w5cValidator, $timeout) {
                return {
                    require: ['w5cFormValidate', '^?form'],
                    controller: [
                        '$scope', '$element', '$attrs',
                        function ($scope, $element, $attrs) {
                            var _self = this;
                            var _formElem = $element[0];
                            this.needBindKeydown = false;
                            this.formCtrl = null;
                            this.submitSuccessFn = null;
                            this.validElements = [];

                            /**
                             * 设置验证方法,并把 doValidate 方法挂载在 form ctrl 上
                             * @param formCtrl
                             */
                            this.setValidate = function (formCtrl) {
                                this.formCtrl = formCtrl;
                                var doValidate = function () {
                                    var errorMessages = [];
                                    //循环验证
                                    for (var i = 0; i < _formElem.elements.length; i++) {
                                        var elemName = _formElem.elements[i].name;
                                        if (elemName && _self.validElements.indexOf(elemName) >= 0) {
                                            var elem = _formElem[elemName];
                                            if (formCtrl[elemName] && elem && w5cValidator.elemTypes.toString().indexOf(elem.type) > -1 && !w5cValidator.isEmpty(elemName)) {
                                                if (formCtrl[elemName].$valid) {
                                                    angular.element(elem).removeClass("error").addClass("valid");
                                                    continue;
                                                } else {
                                                    var elementErrors = w5cValidator.getErrorMessages(elem, formCtrl[elem.name].$error);
                                                    errorMessages.push(elementErrors[0]);
                                                    w5cValidator.removeError(elem, _self.options);
                                                    w5cValidator.showError(elem, elementErrors, _self.options);
                                                    formCtrl[elemName].w5cError = true;
                                                }
                                            }
                                        }
                                    }
                                    if (!w5cValidator.isEmpty(errorMessages) && errorMessages.length > 0) {
                                        formCtrl.$errors = errorMessages;
                                    } else {
                                        formCtrl.$errors = [];
                                    }
                                    if (!$scope.$$phase) {
                                        $scope.$apply(formCtrl.$errors);
                                    }
                                };
                                formCtrl.doValidate = doValidate;
                                formCtrl.reset = function () {
                                    $timeout(function () {
                                        formCtrl.$setPristine();
                                        for (var i = 0; i < _formElem.elements.length; i++) {
                                            var elem = _formElem.elements[i];
                                            var $elem = angular.element(elem);
                                            w5cValidator.removeError($elem, _self.options);
                                        }
                                        formCtrl.$errors = [];
                                    });
                                };

                                //w5cSubmit is function
                                var formSubmitFn = $parse($attrs.w5cSubmit);
                                if ($attrs.w5cSubmit && angular.isFunction(formSubmitFn)) {
                                    $element.bind("submit", function (event) {
                                        doValidate();
                                        if (formCtrl.$valid && angular.isFunction(formSubmitFn)) {
                                            $scope.$apply(function () {
                                                formSubmitFn($scope, {$event: event});
                                            });
                                        }
                                    });
                                    //_self.submitSuccessFn = formSubmitFn;
                                    this.needBindKeydown = true;
                                }
                                if (this.needBindKeydown) {
                                    $element.bind("keydown keypress", function (event) {
                                        if (event.which === 13) {
                                            var currentInput = document.activeElement;
                                            if (currentInput.type && currentInput.type !== "textarea") {
                                                var button = $element.find("button");
                                                if (button && button[0]) {
                                                    button[0].focus();
                                                }
                                                currentInput.focus();
                                                doValidate();
                                                event.preventDefault();
                                                if (formCtrl.$valid && angular.isFunction(_self.submitSuccessFn)) {
                                                    $scope.$apply(function () {
                                                        _self.submitSuccessFn($scope, {$event: event});
                                                    });
                                                }
                                            }
                                        }
                                    });
                                }
                            };

                            /**
                             * 用户和其他组件交互使用, 目前有 w5cFormSubmit和w5cDynamicElement 指令调用
                             * @param success 验证成功后调用函数
                             * @param event 事件回调
                             */
                            this.doValidate = function (success, event) {
                                if (angular.isFunction(this.formCtrl.doValidate)) {
                                    this.formCtrl.doValidate();
                                }
                                if (this.formCtrl.$valid && angular.isFunction(success)) {
                                    $scope.$apply(function () {
                                        success($scope, {$event: event});
                                    });
                                }
                            };

                            /**
                             * 根据 name 移除某个元素的验证
                             * @param name
                             */
                            this.removeElementValidation = function (name) {
                                var index = this.validElements.indexOf(name);
                                if (index >= 0) {
                                    this.validElements.splice(index, 1);
                                    if (!w5cValidator.isEmpty(this.formCtrl.$errors)) {
                                        this.doValidate(angular.noop);
                                    }
                                }
                            };

                            /**
                             * 根据$element移除某个元素的错误信息
                             * @param $elem
                             */
                            this.removeError = function ($elem) {
                                this.formCtrl.$errors = [];
                                this.formCtrl[$elem[0].name] && (this.formCtrl[$elem[0].name].w5cError = false);
                                w5cValidator.removeError($elem, this.options);
                            };

                            /**
                             * 初始化元素的验证
                             * @param elem
                             */
                            this.initElement = function (elem) {
                                var $elem = angular.element(elem);
                                var ctrl = this;

                                if (w5cValidator.elemTypes.toString().indexOf(elem.type) > -1 && !w5cValidator.isEmpty(elem.name) && !/^\d/.test(elem.name)) {
                                    var disabled = $elem.attr('disabled');
                                    if (disabled && (disabled === 'true' || disabled === 'disabled')) {
                                        return;
                                    }
                                    //formCtrl[elem.name].$viewChangeListeners.push(function () {
                                    //    formCtrl.$errors = [];
                                    //    w5cValidator.removeError($elem, options);
                                    //});
                                    if (this.validElements.indexOf(elem.name) < 0) {
                                        this.validElements.push(elem.name);
                                    } else {
                                        return;
                                    }
                                    var $viewValueName = this.formName + "." + elem.name + ".$viewValue";
                                    //监控输入框的value值当有变化时移除错误信息
                                    //可以修改成当输入框验证通过时才移除错误信息，只要监控$valid属性即可
                                    $scope.$watch($viewValueName, function () {
                                        ctrl.removeError($elem);
                                    }, true);
                                    //光标移走的时候触发验证信息
                                    if (ctrl.options && ctrl.options.blurTrig) {
                                        $elem.bind("blur", function () {
                                            if (!ctrl.options.blurTrig) {
                                                return;
                                            }
                                            var element = this;
                                            var $elem = angular.element(this);
                                            $timeout(function () {
                                                if (!_self.formCtrl[element.name].$valid) {
                                                    var errorMessages = w5cValidator.getErrorMessages(element, _self.formCtrl[element.name].$error);
                                                    w5cValidator.showError($elem, errorMessages, _self.options);
                                                    if (_self.formCtrl[$elem[0].name]) {
                                                        _self.formCtrl[$elem[0].name].w5cError = true;
                                                    }
                                                } else {
                                                    w5cValidator.removeError($elem, _self.options);
                                                }
                                            }, 50);
                                        });
                                    }
                                }
                            };

                            /**
                             * 初始化form验证参数和内部元素
                             * @private
                             */
                            this._init = function () {
                                this.formName = $element.attr("name");
                                if (!this.formName) {
                                    throw Error("form must has name when use w5cFormValidate");
                                }
                                var options = $scope.$eval($attrs.w5cFormValidate);
                                if ($attrs.w5cFormValidate) {
                                    $scope.$watch($attrs.w5cFormValidate, function (newValue) {
                                        if (newValue) {
                                            _self.options = options = angular.extend({}, w5cValidator.options, newValue);
                                        }
                                    }, true)
                                }
                                this.options = angular.extend({}, w5cValidator.options, options);

                                //初始化验证规则，并时时监控输入值的变话
                                for (var i = 0; i < $element[0].elements.length; i++) {
                                    this.initElement($element[0].elements[i]);
                                }
                            };

                            this._init();
                        }],
                    link: function (scope, form, attr, ctrls) {
                        var ctrl = ctrls[0], formCtrl = ctrls[1];

                        ctrl.setValidate(formCtrl);
                    }
                };
            }])
        .directive("w5cFormSubmit", ['$parse', function ($parse) {
            return {
                require: "^w5cFormValidate",
                link: function (scope, element, attr, ctrl) {
                    var validSuccessFn = $parse(attr.w5cFormSubmit);
                    element.bind("click", function (event) {
                        ctrl.doValidate(validSuccessFn, event);
                    });
                    ctrl.needBindKeydown = true;
                    ctrl.submitSuccessFn = validSuccessFn;
                }
            };
        }])
        .directive("w5cRepeat", ['$timeout', function ($timeout) {
            'use strict';
            return {
                require: ["ngModel", "^w5cFormValidate"],
                link: function (scope, elem, attrs, ctrls) {
                    $timeout(function () {
                        var otherInput = elem.inheritedData("$formController")[attrs.w5cRepeat];
                        var ngModel = ctrls[0], w5cFormCtrl = ctrls[1];
                        ngModel.$parsers.push(function (value) {
                            if (value === otherInput.$viewValue) {
                                ngModel.$setValidity("repeat", true);
                            } else {
                                ngModel.$setValidity("repeat", false);
                            }
                            return value;
                        });

                        otherInput.$parsers.push(function (value) {
                            ngModel.$setValidity("repeat", value === ngModel.$viewValue);
                            if (value === ngModel.$viewValue) {
                                w5cFormCtrl.removeError(elem);
                            }
                            return value;
                        });
                    });
                }
            };
        }])
        .directive("w5cCustomizer", ['$timeout', function ($timeout) {
            'use strict';
            return {
                require: ["^form", "?ngModel"],
                link: function (scope, elem, attrs, ctrls) {
                    var ngModelCtrl = ctrls[1];
                    var $validate = function (value) {
                        var validate = scope.$eval(attrs.w5cCustomizer);
                        if (validate === true) {
                            ngModelCtrl.$setValidity("customizer", true);
                        } else {
                            ngModelCtrl.$setValidity("customizer", false);
                        }
                        
                        return value;
                    };
                    var associate = ctrls[0][attrs.associate];
                    associate && associate.$viewChangeListeners.push($validate);
                    ngModelCtrl.$viewChangeListeners.push($validate);

                    ngModelCtrl.$parsers.unshift($validate);

                    $validate();
                }
            };
        }])
        .directive("w5cUniqueCheck", ['$timeout', '$http', 'w5cValidator', function ($timeout, $http, w5cValidator) {
            return {
                require: ["ngModel", "?^w5cFormValidate", "?^form"],
                link: function (scope, elem, attrs, ctrls) {
                    var ngModelCtrl = ctrls[0], w5cFormCtrl = ctrls[1], formCtrl = ctrls[2];

                    var doValidate = function () {
                        var attValues = scope.$eval(attrs.w5cUniqueCheck);
                        var url = attValues.url;
                        var isExists = attValues.isExists;//default is true
                        $http.get(encodeURI(encodeURI(url))).success(function (data) {
                            //var state = isExists === false ? (data == 'true' || data == true) : !(data == 'true' || data == true);
                            if (data.resultCode == -1) {
                                location.href = data.resultMessage;
                                return;
                            }
                            var state = data.data;
                            ngModelCtrl.$setValidity('w5cuniquecheck', state);
                            if (!state) {
                                // var errorMsg = w5cValidator.getErrorMessage("w5cuniquecheck", elem[0]);
                                //add by xj
                                var errorMsg = data.resultMessage;
                                var rules = {};
                                rules[ngModelCtrl.$name] = {};
                                rules[ngModelCtrl.$name]["w5cuniquecheck"] = errorMsg;
                                w5cValidator.setRules(rules);
                                //end
                                w5cValidator.showError(elem[0], [errorMsg], w5cFormCtrl.options);
                                if (formCtrl[elem[0].name]) {
                                    formCtrl[elem[0].name].w5cError = true;
                                }
                                if (!formCtrl.$errors) {
                                    formCtrl.$errors = [errorMsg];
                                } else {
                                    formCtrl.$errors.unshift(errorMsg);
                                }
                            }
                        });
                    };

                    ngModelCtrl.$viewChangeListeners.push(function () {
                        formCtrl.$errors = [];
                        ngModelCtrl.$setValidity('w5cuniquecheck', true);
                        if (ngModelCtrl.$invalid && !ngModelCtrl.$error.w5cuniquecheck) {
                            return;
                        }
                        if (ngModelCtrl.$dirty) {
                            doValidate();
                        }
                    });

                    var firstValue = scope.$eval(attrs.ngModel);
                    if (firstValue) {
                        if (ngModelCtrl.$invalid && !ngModelCtrl.$error.w5cuniquecheck) {
                            return;
                        }
                        doValidate();
                    }
                }
            };
        }])
        .directive('w5cDynamicName', [function () {
            return {
                restrict: 'A',
                require: "?ngModel",
                link: function (scope, elm, attrs, ngModelCtr) {
                    ngModelCtr.$name = scope.$eval(attrs.w5cDynamicName);
                    elm.attr('name', scope.$eval(attrs.w5cDynamicName));
                    var formController = elm.controller('form') || {
                            $addControl: angular.noop
                        };
                    formController.$addControl(ngModelCtr);
                }
            };
        }])
        .directive('w5cDynamicElement', ["$timeout", function ($timeout) {
            return {
                restrict: 'A',
                require: ["?ngModel", "?^w5cFormValidate", "?^form"],
                link: function (scope, elm, attrs, ctrls) {
                    var name = elm[0].name, formCtrl = ctrls[2];
                    if (name) {
                        elm.on("$destroy", function (e) {
                            ctrls[1].removeElementValidation(name);
                        });
                        if (!formCtrl[name]) {
                            formCtrl.$addControl(ctrls[0]);
                        }
                        var needValidate = false;
                        if (ctrls[2].$errors && ctrls[2].$errors.length > 0) {
                            needValidate = true;
                        }
                        ctrls[1].initElement(elm[0]);
                        if (needValidate) {
                            $timeout(function () {
                                ctrls[1].doValidate(angular.noop);
                            });
                        }
                    }
                }
            };
        }]);
})();

// Simple Set Clipboard System
// Author: Joseph Huckaby

var ZeroClipboard = {
	version: "1.0.7",
	clients: {}, // registered upload clients on page, indexed by id
	moviePath:'common/images/components/ZeroClipboard.swf', // URL to movie
	nextId: 1, // ID of next movie
	
	$: function(thingy) {
		// simple DOM lookup utility function
		if (typeof(thingy) == 'string') thingy = document.getElementById(thingy);
		if (!thingy.addClass) {
			// extend element with a few useful methods
			thingy.hide = function() { this.style.display = 'none'; };
			thingy.show = function() { this.style.display = ''; };
			thingy.addClass = function(name) { this.removeClass(name); this.className += ' ' + name; };
			thingy.removeClass = function(name) {
				var classes = this.className.split(/\s+/);
				var idx = -1;
				for (var k = 0; k < classes.length; k++) {
					if (classes[k] == name) { idx = k; k = classes.length; }
				}
				if (idx > -1) {
					classes.splice( idx, 1 );
					this.className = classes.join(' ');
				}
				return this;
			};
			thingy.hasClass = function(name) {
				return !!this.className.match( new RegExp("\\s*" + name + "\\s*") );
			};
		}
		return thingy;
	},
	
	setMoviePath: function(path) {
		// set path to ZeroClipboard.swf
		this.moviePath = path;
	},
	dispatch: function(id, eventName, args) {
		// receive event from flash movie, send to client		
		var client = this.clients[id];
		if (client) {
			client.receiveEvent(eventName, args);
		}
	},
	
	register: function(id, client) {
		// register new client to receive events
		this.clients[id] = client;
	},
	
	getDOMObjectPosition: function(obj, stopObj) {
		// get absolute coordinates for dom element
		var info = {
			left: 0, 
			top: 0, 
			width: obj.width ? obj.width : obj.offsetWidth, 
			height: obj.height ? obj.height : obj.offsetHeight
		};

		while (obj && (obj != stopObj)) {
			info.left += obj.offsetLeft;
			info.top += obj.offsetTop;
			obj = obj.offsetParent;
		}

		return info;
	},
	
	Client: function(elem) {
		// constructor for new simple upload client
		this.handlers = {};
		
		// unique ID
		this.id = ZeroClipboard.nextId++;
		this.movieId = 'ZeroClipboardMovie_' + this.id;
		
		// register client with singleton to receive flash events
		ZeroClipboard.register(this.id, this);
		
		// create movie
		if (elem) this.glue(elem);
	}
};

ZeroClipboard.Client.prototype = {
	
	id: 0, // unique ID for us
	ready: false, // whether movie is ready to receive events or not
	movie: null, // reference to movie object
	clipText: '', // text to copy to clipboard
	handCursorEnabled: true, // whether to show hand cursor, or default pointer cursor
	cssEffects: true, // enable CSS mouse effects on dom container
	handlers: null, // user event handlers
	
	glue: function(elem, appendElem, stylesToAdd) {
		// glue to DOM element
		// elem can be ID or actual DOM element object
		this.domElement = ZeroClipboard.$(elem);
		
		// float just above object, or zIndex 99 if dom element isn't set
		var zIndex = 9999;
		if (this.domElement.style.zIndex) {
			zIndex = parseInt(this.domElement.style.zIndex, 10) + 1;
		}
		
		if (typeof(appendElem) == 'string') {
			appendElem = ZeroClipboard.$(appendElem);
		}
		else if (typeof(appendElem) == 'undefined') {
			appendElem = document.getElementsByTagName('body')[0];
		}
		
		// find X/Y position of domElement
		var box = ZeroClipboard.getDOMObjectPosition(this.domElement, appendElem);
		
		// create floating DIV above element
		this.div = document.createElement('div');
		this.div.classList.add("zeroclipboard");
		var style = this.div.style;
		style.position = 'absolute';
		style.left = '' + box.left + 'px';
		style.top = '' + box.top + 'px';
		style.width = '' + box.width + 'px';
		style.height = '' + box.height + 'px';
		style.zIndex = zIndex;
		
		if (typeof(stylesToAdd) == 'object') {
			for (addedStyle in stylesToAdd) {
				style[addedStyle] = stylesToAdd[addedStyle];
			}
		}
		
		// style.backgroundColor = '#f00'; // debug
		
		appendElem.appendChild(this.div);
		
		this.div.innerHTML = this.getHTML( box.width, box.height );
	},
	
	getHTML: function(width, height) {
		// return HTML for movie
		var html = '';
		var flashvars = 'id=' + this.id + 
			'&width=' + width + 
			'&height=' + height;
			
		if (navigator.userAgent.match(/MSIE/)) {
			// IE gets an OBJECT tag
			var protocol = location.href.match(/^https/i) ? 'https://' : 'http://';
			html += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+protocol+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="'+width+'" height="'+height+'" id="'+this.movieId+'" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+ZeroClipboard.moviePath+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+flashvars+'"/><param name="wmode" value="transparent"/></object>';
		}
		else {
			// all other browsers get an EMBED tag
			html += '<embed id="'+this.movieId+'" src="'+ZeroClipboard.moviePath+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+width+'" height="'+height+'" name="'+this.movieId+'" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvars+'" wmode="transparent" />';
		}
		return html;
	},
	
	hide: function() {
		// temporarily hide floater offscreen
		if (this.div) {
			this.div.style.left = '-2000px';
		}
	},
	
	show: function() {
		// show ourselves after a call to hide()
		this.reposition();
	},
	
	destroy: function() {
		// destroy control and floater
		if (this.domElement && this.div) {
			this.hide();
			this.div.innerHTML = '';
			
			var body = document.getElementsByTagName('body')[0];
			try { body.removeChild( this.div ); } catch(e) {;}
			
			this.domElement = null;
			this.div = null;
		}
	},
	
	reposition: function(elem) {
		// reposition our floating div, optionally to new container
		// warning: container CANNOT change size, only position
		if (elem) {
			this.domElement = ZeroClipboard.$(elem);
			if (!this.domElement) this.hide();
		}
		
		if (this.domElement && this.div) {
			var box = ZeroClipboard.getDOMObjectPosition(this.domElement);
			var style = this.div.style;
			style.left = '' + box.left + 'px';
			style.top = '' + box.top + 'px';
		}
	},
	
	setText: function(newText) {
		// set text to be copied to clipboard
		this.clipText = newText;
		if (this.ready) this.movie.setText(newText);
	},
	
	addEventListener: function(eventName, func) {
		// add user event listener for event
		// event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
		eventName = eventName.toString().toLowerCase().replace(/^on/, '');
		if (!this.handlers[eventName]) this.handlers[eventName] = [];
		this.handlers[eventName].push(func);
	},
	
	setHandCursor: function(enabled) {
		// enable hand cursor (true), or default arrow cursor (false)
		this.handCursorEnabled = enabled;
		if (this.ready) this.movie.setHandCursor(enabled);
	},
	
	setCSSEffects: function(enabled) {
		// enable or disable CSS effects on DOM container
		this.cssEffects = !!enabled;
	},
	
	receiveEvent: function(eventName, args) {
		// receive event from flash
		eventName = eventName.toString().toLowerCase().replace(/^on/, '');
				
		// special behavior for certain events
		switch (eventName) {
			case 'load':
				// movie claims it is ready, but in IE this isn't always the case...
				// bug fix: Cannot extend EMBED DOM elements in Firefox, must use traditional function
				this.movie = document.getElementById(this.movieId);
				if (!this.movie) {
					var self = this;
					setTimeout( function() { self.receiveEvent('load', null); }, 1 );
					return;
				}
				
				// firefox on pc needs a "kick" in order to set these in certain cases
				if (!this.ready && navigator.userAgent.match(/Firefox/) && navigator.userAgent.match(/Windows/)) {
					var self = this;
					setTimeout( function() { self.receiveEvent('load', null); }, 100 );
					this.ready = true;
					return;
				}
				
				this.ready = true;
				this.movie.setText( this.clipText );
				this.movie.setHandCursor( this.handCursorEnabled );
				break;
			
			case 'mouseover':
				if (this.domElement && this.cssEffects) {
					this.domElement.addClass('hover');
					if (this.recoverActive) this.domElement.addClass('active');
				}
				break;
			
			case 'mouseout':
				if (this.domElement && this.cssEffects) {
					this.recoverActive = false;
					if (this.domElement.hasClass('active')) {
						this.domElement.removeClass('active');
						this.recoverActive = true;
					}
					this.domElement.removeClass('hover');
				}
				break;
			
			case 'mousedown':
				if (this.domElement && this.cssEffects) {
					this.domElement.addClass('active');
				}
				break;
			
			case 'mouseup':
				if (this.domElement && this.cssEffects) {
					this.domElement.removeClass('active');
					this.recoverActive = false;
				}
				break;
		} // switch eventName
		
		if (this.handlers[eventName]) {
			for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
				var func = this.handlers[eventName][idx];
			
				if (typeof(func) == 'function') {
					// actual function reference
					func(this, args);
				}
				else if ((typeof(func) == 'object') && (func.length == 2)) {
					// PHP style object + method, i.e. [myObject, 'myMethod']
					func[0][ func[1] ](this, args);
				}
				else if (typeof(func) == 'string') {
					// name of function
					window[func](this, args);
				}
			} // foreach event handler defined
		} // user defined handler for event
	}
	
};

angular.module("ng.ui", [
    'ngAnimate',
    'ngResource',
    'ngRoute',
    'ui.router',
    'ngSanitize']);
angular.module("dp.ui", [
    "ui.bootstrap.alert",
    "dp.ui.areapicker",
    "ui.bootstrap.bindHtml",
    "cgBusy",
    "dp.ui.confirm",
    "dp.ui.datepicker",
    "dp.ui.flex",
    "dp.ui.goodList",
    "ui.bootstrap.modal",
    "dp.ui.paging",
    "dp.ui.pop",
    "dp.ui.input",
    "ui.bootstrap.popover",
    "ui.bootstrap.position",
    "dp.ui.select",
    "dp.ui.smsEditor",
    "dp.ui.star",
    "ui.bootstrap.timepicker",
    "ui.bootstrap.tooltip",
    "ui.bootstrap.transition",
    "dp.ui.fileupload",
    "dp.ui.cookies",
    "w5c.validator",
    "dp.ui.base"
]);


+ function($) {

    if (!$) {
        throw new Error("jquery.location base in jQuery");
    }

    function Location(href) {
        var obj = getLocation(href)
        this.hash = obj.hash;
        this.host = obj.host;
        this.href = obj.href;
        this.origin = obj.origin;
        this.pathname = obj.pathname;
        this.port = obj.port;
        this.protocol = obj.protocol;
    }

    function getLocation(href) {
        if (!href) {
            return window.location;
        }

        var a = document.createElement("a"),
            reuslt = {};
        a.href = href;
        reuslt.hash = a.hash;
        reuslt.host = a.host;
        reuslt.href = a.href;
        reuslt.origin = a.origin;
        reuslt.pathname = a.pathname;
        reuslt.port = a.port;
        reuslt.protocol = a.protocol;
        return reuslt;
    }

    Location.prototype = {
        hashNodes: function() {
            var hash = this.hash;
            if (!hash) return [];

            var splitIndex = hash.indexOf("?"),
                hasVars = splitIndex != -1,
                start = hash.indexOf("#/") + 2,
                end = hasVars ? hash.indexOf("?") : hash.length,
                nodes;
            nodes = hash.slice(start, end).split("/");
            return nodes;
        },
        search: function(name) {
            var href = this.href,
                vars = {},
                splitIndex = href.indexOf("?"),
                hasVars = (splitIndex != -1) && (splitIndex != href.length - 1),
                varArray = hasVars ? href.slice(href.indexOf('?') + 1).split('&') : [];
            for (var i = 0; i < varArray.length; i++) {
                var varInstance = varArray[i].split('=');
                vars[varInstance[0]] = varInstance[1];
            }
            return name ? vars[name + ""] : vars;
        }
    };

    $.location = function(href) {
        var obj = new Location(href);
        return obj;
    }
}(jQuery);

+ function($) {
    $.common = {};

    //是否为true字符串
    $.common.isTrueStr = function(value) {
        return String(value).toLowerCase() == "true";
    }

    //获取浏览器兼容
    $.common.support = function() {
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1]:
            (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
            (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
            (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

        if (Sys.ie) {
            Sys.version = parseInt((/msie (\d+)/.exec(ua.toLowerCase()) || [])[1]);
            if (isNaN(Sys.version)) {
                Sys.version = parseInt((/trident\/.*; rv:(\d+)/.exec(ua.toLowerCase()) || [])[1]);
            }
        }

        return Sys;
    }


}(jQuery);

/*
 * Created with Sublime Text 3.
 * demo地址: http://www.lovewebgames.com/jsmodule/index.html
 * github: https://github.com/tianxiangbing/query
 * User: 田想兵
 * Date: 2015-06-11
 * Time: 16:27:55
 * Contact: 55342775@qq.com
 * Desc: 确保代码最新及时修复bug，请去github上下载最新源码 https://github.com/tianxiangbing/query
 */
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Query = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	var Query = {
		getQuery: function(name, type, win) {
			var reg = new RegExp("(^|&|#)" + name + "=([^&]*)(&|$|#)", "i");
			win = win || window;
			var Url = win.location.href;
			var u, g, StrBack = '';
			if (type == "#") {
				u = Url.split("#");
			} else {
				u = Url.split("?");
			}
			if (u.length == 1) {
				g = '';
			} else {
				g = u[1];
			}
			if (g != '') {
				gg = g.split(/&|#/);
				var MaxI = gg.length;
				str = arguments[0] + "=";
				for (i = 0; i < MaxI; i++) {
					if (gg[i].indexOf(str) == 0) {
						StrBack = gg[i].replace(str, "");
						break;
					}
				}
			}
			return decodeURI(StrBack);
		},
		getForm: function(form) {
			var result = {},
				tempObj = {};
			$(form).find('*[name]').each(function(i, v) {
				var nameSpace,
					name = $(v).attr('name'),
					val = $.trim($(v).val()),
					tempArr = [];
				if (name == '' || $(v).hasClass('getvalued')) {
					return;
				}

				if ($(v).data('type') == "money") {
					val = val.replace(/\,/gi, '');
				}

				//处理radio add by yhx  2014-06-18
				if ($(v).attr("type") == "radio") {
					var tempradioVal = null;
					$("input[name='" + name + "']:radio").each(function() {
						if ($(this).is(":checked"))
							tempradioVal = $.trim($(this).val());
					});
					if (tempradioVal) {
						val = tempradioVal;
					} else {
						val = "";
					}
				}


				if ($(v).attr("type") == "checkbox") {
					var tempradioVal = [];
					$("input[name='" + name + "']:checkbox").each(function() {
						if ($(this).is(":checked"))
							tempradioVal.push($.trim($(this).val()));
					});
					if (tempradioVal.length) {
						val = tempradioVal.join(',');
					} else {
						val = "";
					}
				}

				if ($(v).attr('listvalue')) {
					if (!result[$(v).attr('listvalue')]) {
						result[$(v).attr('listvalue')] = [];
						$("input[listvalue='" + $(v).attr('listvalue') + "']").each(function() {
							if ($(this).val() != "") {
								var name = $(this).attr('name');
								var obj = {};
								if ($(this).data('type') == "json") {
									obj[name] = JSON.parse($(this).val());
								} else {
									obj[name] = $.trim($(this).val());
								}
								if ($(this).attr("paramquest")) {
									var o = JSON.parse($(this).attr("paramquest"));
									obj = $.extend(obj, o);
								}
								result[$(v).attr('listvalue')].push(obj);
								$(this).addClass('getvalued');
							}
						});
					}
				}

				if ($(v).attr('arrayvalue')) {
					if (!result[$(v).attr('arrayvalue')]) {
						result[$(v).attr('arrayvalue')] = [];
						$("input[arrayvalue='" + $(v).attr('arrayvalue') + "']").each(function() {
							if ($(this).val() != "") {
								var obj = {};
								if ($(this).data('type') == "json") {
									obj = JSON.parse($(this).val());
								} else {
									obj = $.trim($(this).val());
								}
								if ($(this).attr("paramquest")) {
									var o = JSON.parse($(this).attr("paramquest"));
									obj = $.extend(obj, o);
								}
								result[$(v).attr('arrayvalue')].push(obj);
							}
						});
					}
				}
				if (name == '' || $(v).hasClass('getvalued')) {
					return;
				}
				//构建参数
				if (name.match(/\./)) {
					tempArr = name.split('.');
					nameSpace = tempArr[0];
					if (tempArr.length == 3) {
						tempObj[tempArr[1]] = tempObj[tempArr[1]] || {};
						tempObj[tempArr[1]][tempArr[2]] = val;
					} else {
						if ($(v).data('type') == "json") {
							tempObj[tempArr[1]] = JSON.parse(val);
							if ($(v).attr("paramquest")) {
								var o = JSON.parse($(v).attr("paramquest"));
								tempObj[tempArr[1]] = $.extend(tempObj[tempArr[1]], o);
							}
						} else {
							tempObj[tempArr[1]] = val;
						}
					}
					if (!result[nameSpace]) {
						result[nameSpace] = tempObj;
					} else {
						result[nameSpace] = $.extend({}, result[nameSpace], tempObj);
					}
				} else {
					result[name] = val;
				}

			});
			var obj = {};
			for (var o in result) {
				var v = result[o];
				if (typeof v == "object") {
					obj[o] = JSON.stringify(v);
				} else {
					obj[o] = result[o]
				}
			}
			$('.getvalued').removeClass('getvalued');
			return obj;
		},
		setHash: function(obj) {
			var str = '';
			obj = $.extend(this.getHash(), obj)
			var arr = [];
			for (var v in obj) {
				if(obj[v]!=''){
					arr.push(v + '=' + encodeURIComponent(obj[v]));
				}
			}
			str+=arr.join('&');
			location.hash = str;
			return this;
		},
		getHash: function(name) {
			if (typeof name === "string") {
				return this.getQuery(name, "#");
			} else {
				var obj = {};
				var hash = location.hash;
				if(hash.length>0){
					hash = hash.substr(1);
					var hashArr = hash.split('&');
					for (var i = 0, l = hashArr.length; i < l; i++) {
						var a = hashArr[i].split('=');
						if (a.length > 0) {
							obj[a[0]] = decodeURI(a[1]) || '';
						}
					}
				}
				return obj;
			}
		}
	};
	return Query;
});

/*
 * Created with Sublime Text 3.
 * demo地址: http://www.lovewebgames.com/jsmodule/index.html
 * github: https://github.com/tianxiangbing/paging
 * User: 田想兵
 * Date: 2015-06-11
 * Time: 16:27:55
 * Contact: 55342775@qq.com
 * Desc: 确保代码最新及时修复bug，请去github上下载最新源码 https://github.com/tianxiangbing/paging
 */
(function (root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$', 'query'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Paging = factory(window.Zepto || window.jQuery || $, Query);
	}
})(this, function ($, Query) {
	$.fn.Paging = function (settings) {
		var arr = [];
		$(this).each(function () {
			var options = $.extend({
				target: $(this)
			}, settings);
			var lz = new Paging();
			lz.init(options);
			arr.push(lz);
		});
		return arr;
	};

	function Paging() {
		var rnd = Math.random().toString().replace('.', '');
		this.id = 'Paging_' + rnd;
	}
	Paging.prototype = {
		init: function (settings) {
			this.settings = $.extend({
				callback: null,
				pagesize: 10,
				current: 1,
				prevTpl: "上一页",
				nextTpl: "下一页",
				firstTpl: "首页",
				lastTpl: "末页",
				ellipseTpl: "...",
				toolbar: false,
				hash: true,
				pageSizeList: [5, 10, 15, 20]
			}, settings);
			this.target = $(this.settings.target);
			this.container = $('<div id="' + this.id + '" class="ui-paging-container "/>');
			this.target.append(this.container);
			this.render(this.settings);
			this.format();
			this.bindEvent();
		},
		render: function (ops) {
			typeof ops.count !== 'undefined' ? this.count = ops.count : this.count =this.settings.count;
			typeof ops.pagesize!== 'undefined' ?  this.pagesize = ops.pagesize : this.pagesize = this.settings.pagesize;
			typeof ops.current!== 'undefined' ? this.current = ops.current: this.current = this.settings.current;
			this.pagecount = Math.ceil(this.count / this.pagesize);
			this.format();
		},
		bindEvent: function () {
			var _this = this;
			this.container.on('click', 'li.js-page-action,li.ui-pager', function (e) {
				if ($(this).hasClass('ui-pager-disabled') || $(this).hasClass('focus')) {
					return false;
				}
				if ($(this).hasClass('js-page-action')) {
					if ($(this).hasClass('js-page-first')) {
						_this.current = 1;
					}
					if ($(this).hasClass('js-page-prev')) {
						_this.current = Math.max(1, _this.current - 1);
					}
					if ($(this).hasClass('js-page-next')) {
						_this.current = Math.min(_this.pagecount, _this.current + 1);
					}
					if ($(this).hasClass('js-page-last')) {
						_this.current = _this.pagecount;
					}
				} else if ($(this).data('page')) {
					_this.current = parseInt($(this).data('page'));
				}
				_this.go();
			});
			/*
			$(window).on('hashchange',function(){
				var page=  parseInt(Query.getHash('page'));
				if(_this.current !=page){
					_this.go(page||1);
				}
			})
			 */
		},
		go: function (p) {
			var _this = this;
			this.current = p || this.current;
			this.current = Math.max(1, _this.current);
			this.current = Math.min(this.current, _this.pagecount);
			this.format();
			if (this.settings.hash) {
				Query.setHash({
					page: this.current
				});
			}
			this.settings.callback && this.settings.callback(this.current, this.pagesize, this.pagecount);
		},
		changePagesize: function (ps) {
			this.render({
				pagesize: ps
			});
		},
		format: function () {
			var html = '<ul>'
			html += '<li class="js-page-first js-page-action ui-pager" >' + this.settings.firstTpl + '</li>';
			html += '<li class="js-page-prev js-page-action ui-pager">' + this.settings.prevTpl + '</li>';
			if (this.pagecount > 6) {
				html += '<li data-page="1" class="ui-pager">1</li>';
				if (this.current <= 2) {
					html += '<li data-page="2" class="ui-pager">2</li>';
					html += '<li data-page="3" class="ui-pager">3</li>';
					html += '<li class="ui-paging-ellipse">' + this.settings.ellipseTpl + '</li>';
				} else
					if (this.current > 2 && this.current <= this.pagecount - 2) {
						if (this.current > 3) {
							html += '<li>' + this.settings.ellipseTpl + '</li>';
						}
						html += '<li data-page="' + (this.current - 1) + '" class="ui-pager">' + (this.current - 1) + '</li>';
						html += '<li data-page="' + this.current + '" class="ui-pager">' + this.current + '</li>';
						html += '<li data-page="' + (this.current + 1) + '" class="ui-pager">' + (this.current + 1) + '</li>';
						if (this.current < this.pagecount - 2) {
							html += '<li class="ui-paging-ellipse" class="ui-pager">' + this.settings.ellipseTpl + '</li>';
						}
					} else {
						html += '<li class="ui-paging-ellipse" >' + this.settings.ellipseTpl + '</li>';
						for (var i = this.pagecount - 2; i < this.pagecount; i++) {
							html += '<li data-page="' + i + '" class="ui-pager">' + i + '</li>'
						}
					}
				html += '<li data-page="' + this.pagecount + '" class="ui-pager">' + this.pagecount + '</li>';
			} else {
				for (var i = 1; i <= this.pagecount; i++) {
					html += '<li data-page="' + i + '" class="ui-pager">' + i + '</li>'
				}
			}
			html += '<li class="js-page-next js-page-action ui-pager">' + this.settings.nextTpl + '</li>';
			html += '<li class="js-page-last js-page-action ui-pager">' + this.settings.lastTpl + '</li>';
			html += '</ul>';
			this.container.html(html);
			if (this.current == 1) {
				$('.js-page-prev', this.container).addClass('ui-pager-disabled');
				$('.js-page-first', this.container).addClass('ui-pager-disabled');
			}
			if (this.current == this.pagecount) {
				$('.js-page-next', this.container).addClass('ui-pager-disabled');
				$('.js-page-last', this.container).addClass('ui-pager-disabled');
			}
			this.container.find('li[data-page="' + this.current + '"]').addClass('focus').siblings().removeClass('focus');
			if (this.settings.toolbar) {
				this.bindToolbar();
			}
		},
		bindToolbar: function () {
			var _this = this;
			var html = $('<li class="ui-paging-toolbar"><select class="ui-select-pagesize"></select><input type="text" class="ui-paging-count"/><a href="javascript:void(0)">跳转</a></li>');
			var sel = $('.ui-select-pagesize', html);
			var str = '';
			for (var i = 0, l = this.settings.pageSizeList.length; i < l; i++) {
				str += '<option value="' + this.settings.pageSizeList[i] + '">' + this.settings.pageSizeList[i] + '条/页</option>';
			}
			sel.html(str);
			sel.val(this.pagesize);
			$('input', html).val(this.current);
			$('input', html).click(function () {
				$(this).select();
			}).keydown(function (e) {
				if (e.keyCode == 13) {
					var current = parseInt($(this).val()) || 1;
					_this.go(current);
				}
			});
			$('a', html).click(function () {
				var current = parseInt($(this).prev().val()) || 1;
				_this.go(current);
			});
			sel.change(function () {
				_this.changePagesize($(this).val());
			});
			this.container.children('ul').append(html);
		}
	}
	return Paging;
});





+(function($) {
    $.share = {};

    //分享到新浪
    $.share.toSina = function() {
        try {
            var rlink = "https://shop" + VENUS_SHOP.outerShopId + ".taobao.com";
            var title = "亲，还记得与我们擦肩而过的那一刻吗?本店活动力度再次升级，这一次不要错过咯，全场包邮5折封顶另有无门槛优优惠卷抢，记得提前收藏哦！";
            var pic = "http://img04.taobaocdn.com/bao/uploaded" + VENUS_SHOP.picPath;
            var top = window.screen.height / 2 - 250;
            var left = window.screen.width / 2 - 300;
            window.open("http://service.weibo.com/share/share.php?pic=" + encodeURIComponent(pic) + "&title=" +
                encodeURIComponent(title.replace(/&nbsp;/g, " ").replace(/<br \/>/g, " ")) + "&url=" + encodeURIComponent(rlink),
                "分享至新浪微博",
                "height=500,width=600,top=" + top + ",left=" + left + ",toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no");


        } catch (e) {
            throw new Error(e);
        }
    }
})(jQuery);
