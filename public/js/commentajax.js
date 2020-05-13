
(function($) {
    console.log("start");
    var newForm = $('#housesSingleForm'),
        commentList = $('#house-comment'),
        houseId = $('#houseFormId'),
    newInput = $('#comment');


    newForm.submit( function (event) {

        var newComment = newInput.val();


        if (newComment) {
            var requestConfig = {
                method: 'POST',
                url: '/houses/new',
                contentType: 'application/json',
                data: JSON.stringify({
                    houseId:houseId.val(),
                    text: newComment
                })
            };

            $.ajax(requestConfig).then(function(responseMessage) {
                console.log(responseMessage);
                var newElement = $(responseMessage);

                commentList.append(newElement)
            })

        }
        event.preventDefault();
    });
})(window.jQuery);