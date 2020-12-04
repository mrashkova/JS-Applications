let notify = (() => {
    $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    })
    function showSuccess(message) {
        let successBox = $('#successBox')
        successBox.find('span').text(message)
        successBox.fadeIn()
        setTimeout(() => successBox.fadeOut(), 5000)
    }

    function showError(message) {
        let errorBox = $('#errorBox')
        errorBox.find('span').text(message)
        errorBox.fadeIn()
        setTimeout(() => errorBox.fadeOut(), 5000)
    }

    function handleError(reason) {
        showError(reason.responseJSON.description)
    }

    return {
        showSuccess,
        showError,
        handleError
    }
})()