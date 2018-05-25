if (window.addEventListener) {
    window.addEventListener("message", listener);
} else {
    // IE8
    window.attachEvent("onmessage", listener);
}

function listener(event) {
    if (event.data.message !== "frame-card-complete") {
        return false;
    }

    $('#paymentFrame').hide();
    $('.info-section').hide();
    $('.payment-loader').removeClass('hidden');

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera


    setTimeout(function () {
        $.get("/gibdd-payment/check-payment-status?id=" + window.fineId, function (data) {
            var response = $.parseJSON(data);
            window.location = response.redirect_url;
        });
    }, 2500)

}

function showFailModal() {
    $('#fail-payment-dialog').modal('show');

    setTimeout(function () {
        $('#fail-payment-dialog').modal('hide');
    }, 10000);

}
$(document).on('pjax:send', function(event) {
    // console.log('pjax send', event.target.id);

    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

    $('.info-section-main').addClass('hidden');
    $('.form-loader').removeClass('hidden');
});

$(document).on('pjax:success', function() {
    $('.info-section-main').removeClass('hidden');
    $('.form-loader').addClass('hidden');
});

function getAdditional(orderHash) {
    $.ajax({
        url: '/search/fssp-api-search?id=' + orderHash,
        success: function(data){
            $('.additional').html(data).show();
            calculateAdditional();
            bindMiltiplePaymentChange();
        },
        error: function () {
            $('.additional').hide();
        },
        timeout: 10000
    });
}

function calculateAdditional() {
    var sum = parseFloat($('#total-sum').attr('data-sum'));

    $('.additional').find("input[type=checkbox]:checked").each(function () {
        sum += parseFloat($(this).attr('data-sum'));
    });

    $('#total-sum').html(sum.toFixed(2));

    if (sum > 100000) {
        $('.sum-alert').removeClass('hidden');
        $('.pay-btn').addClass('hidden');
        $('.field-fsspcustomer-email').addClass('hidden');
    } else  {
        $('.sum-alert').addClass('hidden');
        $('.pay-btn').removeClass('hidden');
        $('.field-fsspcustomer-email').removeClass('hidden');
    }
}

function bindMiltiplePaymentChange() {
    $('#payment-form').bind('change', function () {
        calculateAdditional();
    })
}

$(document).ready(function () {
    calculateAdditional();
    bindMiltiplePaymentChange();
})