require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/Graphic"
  ], (Map, MapView, FeatureLayer, Legend, Graphic) =>  {
  
    
  
    ////Use the variables above as your symbol properties of the class break infos property////

    
  
    const map = new Map({
      basemap: "gray-vector",
      layers: []
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-100.3487846, 39.58907],
      zoom: 3
    });
  
    const legend = new Legend({
      view: view
    });
  
    view.ui.add(legend, "bottom-left");
    var $table = $('#table')
    let renderer1 = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-fill",  // autocasts as new SimpleFillSymbol()
          color: [ 51, 159, 194, 0.5 ],
          outline: {  // autocasts as new SimpleLineSymbol()
            width: 1,
            color: "white"
          }
        }
      };

      let renderer2 = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-fill",  // autocasts as new SimpleFillSymbol()
          color: [ 218, 150, 33, 0.5 ],
          outline: {  // autocasts as new SimpleLineSymbol()
            width: 1,
            color: "white"
          }
        }
      };
   
  ///this is where you'll query the service to add data to your table
  var graphics = []
  var graphics2 = []
  var complete = 0
  var loadData = new Promise((resolve, reject)=>{
    var url = new FeatureLayer({url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_10_14_Median_Age_Boundaries/FeatureServer/1",
    title: "median age ACS",
    popupTemplate: {
      // autocast as esri/PopupTemplate
      title: "{county }",
      content:
        "median age: {B01002_001E }  " 
    },
    opacity: 0.9})

    let query = url.createQuery();
    query.where = "B01002_001E  < 27 "
    query.returnGeometry = true;
    query.outFields = [ "B01002_001E ", "Name", "State" ];

    url.queryFeatures(query)
    .then(function(response){
    console.log(response)
    response.features.forEach(function(feature, index){
        let gfx = new Graphic({
            geometry: feature.geometry,
            attributes: {"medianAge": feature.attributes.B01002_001E, "county": feature.attributes.NAME, "state": feature.attributes.State,  "ObjectId": index}                   
          });
          var state = feature.attributes.State
          var county = feature.attributes.NAME
          var age = feature.attributes.B01002_001E 
          graphics.push(gfx)
              $table.bootstrapTable('insertRow', {
              index: index,
              row: {
                county: county,
                state: state,
                age: age
              }
              })
            console.log(index)
            if(index == response.features.length -1){
                complete = 1
            }
    })
    }); 
    let query2 = url.createQuery();
    query2.where = "B01002_001E  > 53"
    query2.returnGeometry = true;
    query2.outFields = [ "B01002_001E ", "Name", "State" ];

    url.queryFeatures(query2)
    .then(function(response){
    console.log(response)
    response.features.forEach(function(feature, index){
        let gfx = new Graphic({
            geometry: feature.geometry,
            attributes: {"medianAge": feature.attributes.B01002_001E, "county": feature.attributes.NAME, "state": feature.attributes.State,  "ObjectId": index}                   
          });
          var state = feature.attributes.State
          var county = feature.attributes.NAME
          var age = feature.attributes.B01002_001E 
          graphics2.push(gfx)
              $table.bootstrapTable('insertRow', {
              index: index,
              row: {
                county: county,
                state: state,
                age: age
              }
              })
            console.log(index)
            if(index == response.features.length -1 && complete ==1){
                resolve()
            }
    })
    }); 

    // if(map.layers.length >0){
    //     resolve();
    // }
  
    }); 
    loadData.then(()=>{
        var fl = new FeatureLayer({
          title: "Youngest Counties",
            source: graphics,
            objectIdField: "ObjectId",
            fields: [{
              name: "ObjectId",
              type: "oid"
            }, {
              name: "State",
              type: "string"
            }, 
            {
                name: "County",
                type: "string"
              }, {
                name: "medianAge",
                type: "double"
              },
        
        ],
            popupTemplate: {
              content: "State: {State} <br>" +
               "County: {County}% <br>"+ 
               "Median Age: {medianAge}" 
            },
            renderer: renderer1
        }) 
        var fl2 = new FeatureLayer({
          title: "Oldest Counties",
            source: graphics2,
            objectIdField: "ObjectId",
            fields: [{
              name: "ObjectId",
              type: "oid"
            }, {
              name: "State",
              type: "string"
            }, 
            {
                name: "County",
                type: "string"
              }, {
                name: "medianAge",
                type: "double"
              },
        
        ],
            popupTemplate: {
              content: "State: {State} <br>" +
               "County: {County}% <br>"+ 
               "Median Age: {medianAge}" 
            },
            renderer: renderer2
        }) 
      
        map.add(fl)
        map.add(fl2)
      console.log('map loaded')
     })
  
  });