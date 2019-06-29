(function(){
  /* wait for the DOM to be ready */
  affirm.ui.ready(function(){
    $(function() {

      // This event listener and the following functions were added
      // specifically for Zohr. This may seem kind of like htting a roach with
      // a sledgehammer, but I think it's a pretty safe way to make sure the
      // billing address arrives at affirm correctly.
      $("#checkout_form_payment input").keyup(function() {
        let billingAddressInputs = [...document.querySelectorAll("#checkout_form_payment .address-form input")];
        billingAddressInputs.forEach(function(input) {
          updatePayloadBillingAddress(parseInputName(input.name), input.value)
        });
      });

      // Replace the data that will be sent to affirm with what what is passed
      // to this function
      function updatePayloadBillingAddress(name, data) {
        let billingAddress = $("#affirm_checkout_payload").data("affirm").billing;
        billingAddress.address[name] = data;
      }

      // Grab the name from the input
      // "order[billing_address][zipcode]" => "zipcode"
      function parseInputName(nameAttribute) {
        return nameAttribute.split(`[`).map(el => el.replace(/\[|\]/g, ``)).pop()
      }

      /*****************************************************\
          setup loading and cancel events for the form
      \*****************************************************/
      affirm.checkout.on("cancel", function(){
        $("#checkout_form_payment input.disabled")
          .attr("disabled", false)
          .removeClass("disabled");
      });

      var button_text = $("#checkout_form_payment input[type='submit']").val();

      $("#checkout_form_payment input[type='submit']").on("loading", function(){
        button_text = $(this).val();
        $(this).val("Loading...");
      })

      .on("done_loading", function(){
        $(this).val(button_text);
      });

      /*****************************************************\
          handle continue button clicks with .open()
      \*****************************************************/
      $('#checkout_form_payment').submit(function(e){
        var checkedPaymentMethod = $('.payment-method-buttons input[type="radio"]:checked').val();
        var affirmPaymentMethodId = $("#affirm_checkout_payload").data("paymentgateway")
        if (affirmPaymentMethodId.toString() === checkedPaymentMethod) {
          var $submit_button = $(this).find("input[type='submit']");

          /*****************************************************\
              set the shared checkout data
          \*****************************************************/
          affirm.checkout($("#affirm_checkout_payload").data("affirm"));

          // show the loading message
          $submit_button.trigger("loading");

          // submit the checkout
          affirm.checkout.post();

          e.preventDefault();
          return false;
        }
      });
    });
  });
}());
