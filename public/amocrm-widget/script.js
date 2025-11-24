define(['jquery'], function($) {
  var CustomWidget = function() {
    this.callbacks = {
      render: function() {
        console.log('AmoCRM Widget render');
        return true;
      },
      init: function() {
        console.log('AmoCRM Widget init');
        return true;
      },
      bind_actions: function() {
        console.log('AmoCRM Widget bind_actions');
        
        var widget = this;
        var widgetUrl = 'https://043bf-rho.poehali.page/widget';
        
        // Получить текущую сделку
        var currentCard = widget.system().area;
        var leadId = null;
        var accountDomain = widget.system().subdomain + '.amocrm.ru';
        
        if (currentCard && currentCard.id) {
          leadId = currentCard.id;
        }
        
        // Создать iframe с виджетом
        var $container = $('<div>', {
          'class': 'widget-calculator-container',
          'css': {
            'width': '100%',
            'min-height': '600px',
            'border': '1px solid #e0e0e0',
            'border-radius': '4px',
            'overflow': 'hidden',
            'margin-top': '10px'
          }
        });
        
        var iframeUrl = widgetUrl + '?lead_id=' + leadId + '&domain=' + accountDomain;
        
        var $iframe = $('<iframe>', {
          'src': iframeUrl,
          'css': {
            'width': '100%',
            'height': '600px',
            'border': 'none'
          },
          'allow': 'clipboard-write'
        });
        
        $container.append($iframe);
        
        // Добавить в правую колонку карточки сделки
        $('.card-widgets__item_' + widget.get_settings().widget_code).append($container);
        
        return true;
      },
      settings: function() {
        console.log('AmoCRM Widget settings');
        return true;
      },
      onSave: function() {
        console.log('AmoCRM Widget onSave');
        return true;
      },
      destroy: function() {
        console.log('AmoCRM Widget destroy');
      }
    };
    
    return this;
  };
  
  return CustomWidget;
});