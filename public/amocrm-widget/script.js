define(['jquery'], function($) {
  var CustomWidget = function() {
    var self = this;
    
    this.callbacks = {
      render: function() {
        return true;
      },
      
      init: function() {
        return true;
      },
      
      bind_actions: function() {
        var widgetUrl = 'https://043bf-rho.poehali.page/widget';
        
        $(document).on('click', '[data-id="open_calculator"]', function() {
          var currentCard = self.system().area;
          var leadId = currentCard && currentCard.id ? currentCard.id : null;
          var accountDomain = self.system().subdomain + '.amocrm.ru';
          
          var iframeUrl = widgetUrl + '?lead_id=' + leadId + '&domain=' + accountDomain;
          
          var modal = new Modal({
            init: function($modal_body) {
              var $iframe = $('<iframe>', {
                src: iframeUrl,
                frameborder: '0',
                width: '100%',
                height: '600px',
                style: 'border: none; display: block;'
              });
              
              $modal_body.append($iframe);
              
              $modal_body.trigger('modal:loaded')
                .trigger('modal:centrify')
                .css({'width': '90%', 'max-width': '1200px', 'height': '80vh'});
            },
            
            destroy: function() {
            }
          });
        });
        
        return true;
      },
      
      settings: function() {
        return true;
      },
      
      onSave: function() {
        return true;
      },
      
      destroy: function() {
      }
    };
    
    return this;
  };
  
  return CustomWidget;
});