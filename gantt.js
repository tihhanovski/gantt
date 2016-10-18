var app = {

  "lm": 10,
  "h": 20,
  "dx": 10,
  "dy": 10,
  "x": 0,
  "y": 0,
  "rulerLongerTickEvery": 6,
  "allowParrallel": false,

  "rectStyle": 'fill:blue; stroke:black; stroke-width: 1;fill-opacity:0.1;',
  "textStyle": 'fill:black; font-family: helvetica; font-size: 10px;',
  "lineStyle": 'fill: none; stroke:black; stroke-width: 0.5;', //fill:none;stroke:black;stroke-width:3
  "rulerLineStyle": 'fill: none; stroke:black; stroke-width: 0.25;', //fill:none;stroke:black;stroke-width:3

  "run": function()
  {
    this.load();
  },

  "load": function()
  {
    var url = "gantt.json";
    var req = $.ajax({
      url: url,
      cache: false,
      dataType: "json"
    })
      .done(function(msg){
        console.log(msg);
        app.data = msg;
        app.build();
      })
      .fail(function(){alert("Failed!")})
      .always(function(){console.log("Loaded")});
  },

  "map": function(collection, func)
  {
    for(var i = 0; i < collection.length; i++)
      func(collection[i]);
  },

  "buildIndex": function(index, collection)
  {
    app.map(collection, function(item)
      {
        if(item.id)
          index[item.id] = item;
        else
        {
          console.log("No id for item");
          console.log(item);
        }
      });
  },

  "getItem": function(id)
  {
    if(!app.itemIndex)
    {
      app.itemIndex = new Object();
      app.buildIndex(app.itemIndex, app.data.items);
    }
    return app.itemIndex[id];
  },

  "getGroup": function(id)
  {
    if(!app.groupIndex)
    {
      app.groupIndex = new Object();
      app.buildIndex(app.groupIndex, app.data.groups);
    }
    return app.itemIndex
  },

  "posItemHor": function(item)
  {
    if(item.prevId)
    {
      var prev = app.getItem(item.prevId);
      if(prev)
      {
        if (prev.x < 0)
          app.posItemHor(prev);
        item.x = prev.x + prev.width + app.dx;
      }
    }

    if(item.x < app.x)
      item.x = app.x;

    app.containerWidth = Math.max(app.containerWidth, item.x + item.width + app.dx);
  },

  "reposition": function()
  {
    app.containerWidth = 0;
    app.containerHeight = 0;
    app.x = -1;
    app.y = app.h + app.dy;
    app.map(app.data.items, function(item)
      {
        item.x = app.x;
        item.y = app.y;
        item.height = app.h;
        item.width = item.length * app.lm;
        app.y += item.height + app.dy;
      }
    );
    app.containerHeight = app.y + app.y + app.dy;

    app.x = app.dx;
    app.map(app.data.items, function(item){app.posItemHor(item)});
    console.log(app.getItem(1));
  },

  "build": function()
  {
    app.reposition();
    app.getContainer().html(this.getSVG());
  },

  "getSVG": function()
  {
    var html = '';
    app.map(app.data.items, function(item)
    {
      html += '<rect ' +
        'x="' + item.x + '" y="' + item.y + '" width="' + item.width + '" height="' + item.height +
        '" style="' + app.rectStyle + '" ></rect>' +
        '<text x="' + (item.x + 2) + '" y="' + (item.y + item.height - 4) + '" width="' + item.width +
        '" style="' + app.textStyle + '">' + item.name + ': ' + item.length + '</text>';

        if(item.prevId)
        {
          var prev = app.getItem(item.prevId)
          if(prev)
          {
            var x1 = prev.x + prev.width + app.dx / 2;
            var y2 = item.y + item.height / 2;
            html += '<polyline points="' + (prev.x + prev.width) + ',' + (prev.y + prev.height / 2) + ' ' +
              x1 + ',' + (prev.y + prev.height / 2) + ' ' +
              x1 + ',' + y2 + ' ' +
              item.x + ',' + y2 + '" style="' + app.lineStyle + '" />';
          }
        }
    });

    var ruler = '<line x1="0" y1="' + app.h + '" x2="' + app.containerWidth + '" y2="' + app.h + '" style="' + app.rulerLineStyle + '" />';

    for(var i = 0; i < app.containerWidth; i += app.lm)
      ruler += '<line x1="' + i + '" y1="' + app.h + '" x2="' + i + '" y2="' + (i % (app.lm * app.rulerLongerTickEvery) == 0 ? 0 : app.h / 2) + '" style="' + app.rulerLineStyle + '" />' +
      (i % (app.lm * app.rulerLongerTickEvery) == 0 ?
        '<text x="' + (i + 2) + '" y="' + (app.h / 2) +
        '" style="' + app.textStyle + '">' + (i / (app.lm * app.rulerLongerTickEvery)) + '</text>' : '');

    return '<svg width="' + app.containerWidth + '" height="' + app.containerHeight + '">' + ruler + html + '</svg>';
  },

  "getContainer": function()
  {
    var ret = $("#ganttContainer");
    if(ret.length < 1)
    {
      $("body").append('<div id="ganttContainer" class="ganttContainer"></div>');
      ret = $("#ganttContainer");
    }
    return ret;
  }
}

$(function(){
  app.run();
})
