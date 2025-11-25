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
        var currentCard = self.system().area;
        var leadId = currentCard && currentCard.id ? currentCard.id : null;
        var accountDomain = self.system().subdomain + '.amocrm.ru';
        
        var $widgetContainer = $('<div class="widget-calculator-wrapper"></div>');
        
        var $iframe = $('<iframe>', {
          src: widgetUrl + '?lead_id=' + leadId + '&domain=' + accountDomain,
          frameborder: '0',
          width: '100%',
          height: '600px',
          style: 'border: none; display: block;'
        });
        
        $widgetContainer.append($iframe);
        
        var $renderTo = $('#' + self.get_settings().widget_code);
        if ($renderTo.length === 0) {
          $renderTo = $('.card-widgets');
        }
        
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