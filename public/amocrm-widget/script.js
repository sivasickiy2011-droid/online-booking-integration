define(['jquery'], function($) {
  var CustomWidget = function() {
    var self = this;
    
    this.callbacks = {
      render: function() {
        console.log('[Calculator Widget] render called');
        return true;
      },
      
      init: function() {
        console.log('[Calculator Widget] init called');
        return true;
      },
      
      bind_actions: function() {
        console.log('[Calculator Widget] bind_actions called');
        
        var widgetUrl = 'https://043bf-rho.poehali.page/widget';
        var $widgetContainer = $('<div>', {
          class: 'widget-calculator-button',
          style: 'padding: 15px; text-align: center;'
        });
        
        var $button = $('<button>', {
          class: 'button-input_blue',
          text: 'Открыть калькулятор',
          style: 'width: 100%; padding: 10px;'
        });
        
        $button.on('click', function() {
          console.log('[Calculator Widget] Button clicked');
          
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
        });
        
        $widgetContainer.append($button);
        
        var $renderTo = $('.card-widgets__item_' + self.get_settings().widget_code);
        if ($renderTo.length === 0) {
          $renderTo = $('.card-widgets');
        }
        
        console.log('[Calculator Widget] Rendering to:', $renderTo);
        $renderTo.append($widgetContainer);
        
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