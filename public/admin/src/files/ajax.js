function ajaxControl(data) {
    $.ajax({
        type: data.type,
        url: data.url,
        data: data.data,
        dataType: data.dataType,
        success: (response) => {
            try {
                if (JSON.parse(response).message == "disconnect") {
                    window.location.replace("/login")
                }
            } catch (e) {
                
            }
            data.success
        }
    })
}