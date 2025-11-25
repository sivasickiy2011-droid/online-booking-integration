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
        console.log('[Calculator Widget] bind_actions called');
        
        self.actions = {
          open_calculator: function() {
            console.log('[Calculator Widget] open_calculator handler fired');
            
            var widgetUrl = 'https://043bf-rho.poehali.page/widget';
            var currentCard = self.system().area;
            var leadId = currentCard && currentCard.id ? currentCard.id : null;
            var accountDomain = self.system().subdomain + '.amocrm.ru';
            
            console.log('[Calculator Widget] Lead ID:', leadId, 'Domain:', accountDomain);
            
            var iframeUrl = widgetUrl + '?lead_id=' + leadId + '&domain=' + accountDomain;
            
            var modal = new Modal({
              init: function($modal_body) {
                console.log('[Calculator Widget] Modal init');
                
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
                console.log('[Calculator Widget] Modal destroyed');
              }
            });
          }
        };
        
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