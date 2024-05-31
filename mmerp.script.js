

function GetItemTypeList(ddlItemType) {
    $.ajax({
        type: 'GET',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: "/ItemType/GetAllItemTypeForDDL",
        async: false,
        success: function (data) {
            var jsonData = data.d;
            $(ddlItemType).html('');
            $(ddlItemType).append($('<option>').text('-- Select --').attr('value', '0'));
            $.each(jsonData, function (i, obj) {
                options = obj.Text;
                $(ddlItemType).append($('<option>').text(obj.Text).attr('value', obj.Value));
            });
        }
    });
};




$(function () {
    jQuery.validator.addMethod(
        "selectNone",
        function (value, element) {
            if (element.value == "0" || element.value == 0) {
                return false;
            }
            else return true;
        },
        "Please select an option."
    );

    if (typeof $.validator != "undefined") {
        $.validator.setDefaults({ ignore: '.NoValidation' });
    }
    HelperDropDowns();
    HelperCascadingDropDowns();
    InitDialogs();
    InitButtons();
    //CurrentDate();

    GetExpectedDate();
    $('.LoadingImage').hide();
    $(document).ajaxStart(function () { $('.LoadingImage').show(); }).ajaxStop(function () { $('.LoadingImage').hide(); });
    $("select").select2();
    MMErpDatePickers();
});

//datepicker for td
$(function () {
    $(document).on("click", ".date_Picker", function () {
        $(this).datepicker().datepicker("show").on('changeDate', function (e) {
            $(this).datepicker('hide');
            var dateString = $.datepicker.formatDate('dd-M-yy', new Date($(this).datepicker('getDate')));
            $(this).val(dateString);

            //
        });

        //var dateRcv;
        //var ReceiveDate = JSON.parse(data.d)[0].PostingDate;
        //if (ReceiveDate != null) {
        //    dateRcv = new Date(parseInt(ReceiveDate.substr(6)));
        //    dateRcv = ParseDate(dateRcv);
        //} else {
        //    dateRcv = "";
        //}
    });
});
//***********
//'yy-mm-dd'
//saving data into the cookies
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function Guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function MMErpDatePickers() {
    var today = new Date();
    //return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
    $(".DatePicker").datepicker({ format: 'dd-M-yyyy', autoclose: true, reset: true, setDates: new Date(today.getFullYear(), today.getMonth(), today.getDate()) });
}

function ParseDate(input) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var parts = input.split('-');
    return new Date(parts[2], months.indexOf(parts[1]), parts[0]);
}

function HelperDropDowns() {
    var dropdownElements = $('select.Dropdown:not(.DropdownInited)');
    $.each(dropdownElements, function (index, element) {
        var dropdownEl = $(element);
        var url = dropdownEl.attr('data-url');
        var selected = dropdownEl.attr('data-selected');
        var dataCache = dropdownEl.attr('data-cache') ? true : false;
        $.ajax({
            url: url,
            type: 'GET',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            cache: dataCache,
            success: function (jsonData, textStatus, XMLHttpRequest) {
                var Listitems = '<option value="">--select--</option>';
                var jsdata = JSON.parse(jsonData.d);
                $.each(jsdata, function (i, item) {
                    if (selected && selected == item.Value) {
                        Listitems += "<option selected='selected' value='" + item.Value + "'>" + item.Text + "</option>";
                    }
                    else {
                        Listitems += "<option value='" + item.Value + "'>" + item.Text + "</option>";
                    }
                });
                dropdownEl.html(Listitems).addClass("DropdownInited");
            }
        });
    });
}

function HelperCascadingDropDowns() {
    var dependentElements = $('select.Cascading:not(.DropdownInited)');
    $.each(dependentElements, function (index, element) {
        var dependentEl = $(element);
        var parentEl = $('#' + dependentEl.attr('data-parent'));
        var url = dependentEl.attr('data-url');
        var selected = dependentEl.attr('data-selected');
        var dataCache = dependentEl.attr('data-cache') ? true : false;
        var loadDropDownItems = function () {
            if (!parentEl.val()) {
                if (selected) {
                    setTimeout(loadDropDownItems, 300);
                }
                return;
            }
            $.ajax({
                url: url + JSON.stringify(parentEl.val()),
                type: 'GET',
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                //data: { 'id': JSON.stringify(parentEl.val()) },
                cache: dataCache,
                success: function (jsonData, textStatus, xmlHttpRequest) {
                    var listitems = '<option></option>';
                    var jsdata = JSON.parse(jsonData.d);
                    $.each(jsdata, function (i, item) {
                        if (selected && selected == item.Value) {
                            listitems += "<option selected='selected' value='" + item.Value + "'>" + item.Text + "</option>";
                        }
                        else {
                            listitems += "<option value='" + item.Value + "'>" + item.Text + "</option>";
                        }
                    });
                    dependentEl.html(listitems).addClass("DropdownInited");
                }
            });
        };
        parentEl.change(loadDropDownItems);
        if (selected) {
            loadDropDownItems();
        }
    });
}

function LoadDropDown(el, url, selected) {
    var id = $(el).attr("id");
    $.ajax({
        url: url,
        type: 'GET',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (jsonData, textStatus, XMLHttpRequest) {
            var Listitems = '<option value="">--select--</option>';
            var jsdata = JSON.parse(jsonData.d);
            $.each(jsdata, function (i, item) {
                if (selected && selected == item.Value) {
                    Listitems += "<option selected='selected' value='" + item.Value + "'>" + item.Text + "</option>";
                }
                else {
                    Listitems += "<option value='" + item.Value + "'>" + item.Text + "</option>";
                }
            });
            $("#" + id).html(Listitems).addClass("DropdownInited");
        }
    });
}

function InitDialogs() {
    $('a.Dialog:not(.DialogInited)').on("click", function () {
        var url = $(this).attr('href');
        $.ajax({
            url: url,
            type: 'GET',
            cache: false,
            success: function (responseText, textStatus, XMLHttpRequest) {
                var html = '' +
                    '<div class="modal fade" id="addNewForm" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                    '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                    '<div class="modal-body">' +
                    responseText +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                var dialogWindow = $(html).appendTo('body');
                dialogWindow.modal({ backdrop: 'static' });
            }
        });
        return false;
    }).addClass("DialogInited");
}

function ShowDialogs(url) {
    $.ajax({
        url: url,
        type: 'GET',
        cache: false,
        success: function (responseText, textStatus, XMLHttpRequest) {
            var html = '' +
                '<div class="modal fade" id="addNewForm" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                '<div class="modal-body">' +
                responseText +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            var dialogWindow = $(html).appendTo('body');
            dialogWindow.modal({ backdrop: 'static' });
        }
    });
}

function CloseModal(el, dataAction, dataUrl) {
    if (dataAction == "formsubmit") {
        $("#" + dataUrl).submit();
    }
    else if (dataAction == "refreshparent") {
        window.parent.location = window.parent.location;
    }
    else if (dataAction == "refreshself") {
        window.location = window.location;
    }
    else if (dataAction == "redirect") {
        window.location = dataUrl;
    }
    else if (dataAction == "function") {
        eval(dataUrl);
    }
    var win = $(el).closest(".modal");
    win.modal("hide");
    setTimeout(function () {
        win.next(".modal-backdrop").remove();
        win.remove();
    }, 500);
}

function MMErpResultSuccess(msg, status) {
    var html = '<div class="alert alert-success alert-dismissible" role="alert">' +
        msg +
        '</div>';
    $('.heading').after(html);
    $(".alert").fadeOut(2000);
}

function MMErpResult(msg, status) {
    var html = '<div class="alert alert-danger alert-dismissible" role="alert">' +
        msg +
        '</div>';
    $('.heading').after(html);
    //$(".alert").fadeOut(5000);
}

function MMErpResult(msg, status, dataAction, dataUrl) {
    var dialogWindow = "";
    if (status == "success" || status == "Success") {
        var html = '' +
            '<div id="userUpdate" class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header modal-title-' + status + '">' +
            '<h4 class="modal-title">MMVMS</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<p>' + msg + '</p>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-primary" data-dismiss="modal" onclick="CloseModal(this, \'' + dataAction + '\',\'' + dataUrl + '\')">OK</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        dialogWindow = $(html).appendTo('body');
        dialogWindow.modal({ backdrop: 'static' });
        setTimeout(function () { $("#userUpdate").modal('hide'); }, 2000);
    } else {
        var html = '' +
            '<div id="userUpdate" class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header modal-title-' + status + '">' +
            '<h4 class="modal-title">MMVMS</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<p>' + msg + '</p>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-primary" data-dismiss="modal" onclick="CloseModal(this, \'' + dataAction + '\',\'' + dataUrl + '\')">OK</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        dialogWindow = $(html).appendTo('body');
        dialogWindow.modal({ backdrop: 'static' });
    }
}

function MMErpAsk(msg, dataAction, dataUrl) {
    var html = '' +
        '<div id="userConfirm" class="modal fade">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header modal-title-ask">' +
        '<h4 class="modal-title">MMVMS</h4>' +
        '</div>' +
        '<div class="modal-body">' +
        msg +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-primary" onclick="CloseModal(this, \'' + dataAction + '\',\'' + dataUrl + '\')">YES</button>' +
        '<button type="button" class="btn btn-primary btn-close" onclick="CloseModal(this)">NO</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    var dialogWindow = $(html).appendTo('body');
    dialogWindow.modal({ backdrop: 'static' });
}

function InitButtons() {
    $('.AddRow:not(.AddRowInited)').on("click", function () {
        var url = $(this).attr('data-url');
        var container = $(this).attr('data-container');
        $.ajax({
            url: url,
            type: 'POST',
            cache: false,
            success: function (html) {
                $("#" + container).append(html);
            }
        });
        return false;
    }).addClass("AddRowInited");

    $('.RemoveRow:not(.RemoveRowInited)').on("click", function () {
        $(this).parents("div.row:first").remove();
        return false;
    }).addClass("RemoveRowInited");
}

     

 function MakeTabindex() {
    $("input:text.tabable:not(.tabableInited)").each(function (i) {
        var el = $(this).parents("tbody").find(".tabable");
        $(el).attr('tabindex', i + 1);
    }).addClass("tabableInited");
};

//function CurrentDate() {
//    var m_names = new Array("Jan", "Feb", "Mar",
//        "Apr", "May", "Jun", "Jul", "Aug", "Sep",
//        "Oct", "Nov", "Dec");
//    var d = new Date();
//    var curr_date = d.getDate();
//    var curr_month = d.getMonth();
//    var curr_year = d.getFullYear();
//    var currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;
//    return currentDate;
//}

function GetExpectedDate(expectedDate) {
    var convertedDate = new Date(expectedDate);
    var m_names = new Array("Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec");
    var curr_date = convertedDate.getDate();
    var curr_month = convertedDate.getMonth();
    var curr_year = convertedDate.getFullYear();
    var currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;
    return currentDate;
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function FormatDate(x) {
    var m_names = new Array("Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec");

    var d = new Date(parseInt(x.substr(6)));
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    var currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;
    return currentDate;
}

function CurrentDate() {
    var m_names = new Array("Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec");
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    console.log(curr_year);
    var currentDate = curr_date + "/" + m_names[curr_month] + "/" + curr_year;
    return currentDate;
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function CurrentTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    str = h + ":" + m + ":" + s;

    return str;
}

function CurrentTimePlusThirtyMin() {
    var momentOfTime = new Date(); // just for example, can be any other time
    var myTimeSpan = 30 * 60 * 1000; // 30 minutes
    momentOfTime.setTime(momentOfTime.getTime() + myTimeSpan);
    var h = momentOfTime.getHours();
    var m = momentOfTime.getMinutes();
    var s = momentOfTime.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    str = h + ":" + m + ":" + s;
    return str;
}

function DecimalDigit() {
    return "2";
}

function DecimalDigitFour() {
    return "4";
}

function DecimalDigitSix() {
    return "6";
}

function DecimalDigitSeven() {
    return "7";
}


actionWisePermission = function () {
    var url = window.location.href;
    $.ajax({
        type: "GET",
        url: "/Home/GetAuthoorizedMenuActionList?menuId=" + JSON.stringify(url.split('/')[4]),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var jsdata = JSON.parse(data.d);
            if (jsdata.GPInsert === 0) {
                $("#btnSave").prop('disabled', true);
                $("#btnSaveNew").prop('disabled', true);
            } else {
                $("#btnSave").prop('disabled', false);
                $("#btnSaveNew").prop('disabled', false);
            }
            if (jsdata.GPEdit === 0 && ($("#btnSave").val() == "Edit" || $("#btnSave").val() == "Update" || $("#btnSave").prop('name') == "Edit")) {
                $("#btnSave").prop('disabled', true);
                $("#btnSaveNew").prop('disabled', true);
            }
            if (jsdata.GPAccept === 0) {
                $("#btnAccept").prop('disabled', true);
                $("#btnAcceptNew").prop('disabled', true);
            } else {
                $("#btnAccept").prop('disabled', false);
                $("#btnAcceptNew").prop('disabled', false);
            }
        },
        error: function (response) {
            MMErpResult("Please contact with your administrator.", "failure");
        }
    });
};

actionWisePermissionForDashBoard = function (menuId, buttonId) {
    $.ajax({
        type: "GET",
        url: "/Home/GetAuthoorizedMenuActionList?menuId=" + menuId,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var jsdata = JSON.parse(data.d);
            if (jsdata != null) {
                if (jsdata.GPView === 1) {
                    $(buttonId).prop("disabled", false);
                } else {
                    $(buttonId).prop("disabled", true);
                }
            } else {
                $(buttonId).prop("disabled", true);
            }
        },
        error: function (response) {
            MMErpResult("Please contact with your administrator.", "failure");
        }
    });
};

function encryptData(p) {
    var key = CryptoJS.enc.Utf8.parse('7061737323313233');
    var iv = CryptoJS.enc.Utf8.parse('7061737323313233');
    var ciphertext = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(p.value), key,
        {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return ciphertext;
};