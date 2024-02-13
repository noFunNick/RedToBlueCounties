require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/Graphic",
], (Map, MapView, FeatureLayer, Legend, Graphic) => {
  ////Use the variables above as your symbol properties of the class break infos property////

  function convertArrayStringsToInts(stringArray) {
    return stringArray.map((string) => {
      const intValue = parseInt(string, 10);
      if (isNaN(intValue)) {
        console.warn(`Invalid string encountered: ${string}`);
        return null; // handle invalid strings gracefully (e.g., log or skip)
      }
      return intValue;
    });
  }
  const map = new Map({
    basemap: "streets-night-vector",
    layers: [],
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-100.3487846, 39.58907],
    zoom: 3,
  });

  const legend = new Legend({
    view: view,
  });

  view.ui.add(legend, "bottom-left");
  var $table = $("#table");
  let renderer1 = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: {
      type: "simple-fill", // autocasts as new SimpleFillSymbol()
      color: [51, 255, 194, 0.5],
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 1,
        color: "white",
      },
    },
  };

  var url = new FeatureLayer({
    url: "https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/2016_US_Presidential_Election_Results_by_County_REP1_Pt/FeatureServer/0/",
    title: "2016 Election",
    popupTemplate: {
      // autocast as esri/PopupTemplate
      title: "{county }",
      content: "median age: {B01002_001E }  ",
    },
    opacity: 0.9,
  });
  var url3 = new FeatureLayer({
    url: "https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/2016_US_Presidential_Election_Results_by_County_REP2_Pt/FeatureServer/0/",
    title: "2020 Election",
    popupTemplate: {
      // autocast as esri/PopupTemplate
      title: "{county }",
      content: "median age: {B01002_001E }  ",
    },
    opacity: 0.9,
  });
  var url2 = new FeatureLayer({
    url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/ArcGIS/rest/services/Election_2020_County/FeatureServer/0/",
    title: "2020 Election",
    popupTemplate: {
      // autocast as esri/PopupTemplate
      title: "{county }",
      content: "median age: {B01002_001E }  ",
    },
    opacity: 0.9,
  });
  ///this is where you'll query the service to add data to your table
  var graphics = [];
  Trump2016 = [];
  Biden2020 = [];
  TrumpBidenFips = [];
  var loadData = new Promise((resolve, reject) => {
    let query2 = url2.createQuery();
    query2.where = "DEMOCRAT > REPUBLICAN";
    query2.returnGeometry = false;
    query2.outFields = [
      "FIPS ",
      "STATE_NAME",
      "County",
      "PER_DEMOCRAT",
      "PER_REPUBLICAN",
      "DEMOCRAT",
      "REPUBLICAN"
    ];

    url2.queryFeatures(query2).then(function (response) {
      console.log(response);
      response.features.forEach(function (feature, index) {
        Biden2020.push(feature.attributes.FIPS);
        if (index == response.features.length - 1) {
          resolve();
        }
      });
    });
  });
  

  loadData.then(() => {
    var secondQuery = new Promise((resolve, reject) => {

  
      let query = url.createQuery();
      const numarray = convertArrayStringsToInts(Biden2020);
      const inclause = numarray.join(",");
      const where = `Winner = 'Trump' AND FIPS in (${inclause})`;
      query.where = where;
      query.returnGeometry = false;
      query.outFields = ["FIPS ", "Name", "STATE_NAME", "Winner"];
  
      url.queryFeatures(query).then(function (response) {
        console.log(response);
        response.features.forEach(function (feature, index) {
          Trump2016.push(feature.attributes.FIPS);
          console.log(index);
          if (index == response.features.length - 1) {
            resolve();
          }
        });
      });
    });
    secondQuery.then(() => {
      var thirdQuery = new Promise((resolve, reject) => {

    
        let query3 = url3.createQuery();
        const numarray = convertArrayStringsToInts(Biden2020);
        const inclause = numarray.join(",");
        const where = `Winner = 'Trump' AND FIPS in (${inclause})`;
        query3.where = where;
        query3.returnGeometry = false;
        query3.outFields = ["FIPS ", "Name", "STATE_NAME", "Winner"];
    
        url3.queryFeatures(query3).then(function (response) {
          console.log(response);
          response.features.forEach(function (feature, index) {
            Trump2016.push(feature.attributes.FIPS);
            console.log(index);
            if (index == response.features.length - 1) {
              resolve();
            }
          });
        });
      });
      thirdQuery.then(()=>{
        var createFinalData = new Promise((resolve, reject) => {
          //var trumpBidenCounties = Trump2016.filter((o) => Biden2020.includes(o));
          //console.log(trumpBidenCounties);
          const numarray = convertArrayStringsToInts(Trump2016);
          const inclause = numarray.join(",");
          const where = `FIPS in (${inclause})`;
          let query3 = url2.createQuery();
          query3.where = where;
          query3.returnGeometry = true;
          query3.outFields = [
            "FIPS ",
            "STATE_NAME",
            "County",
            "PER_DEMOCRAT",
            "PER_REPUBLICAN",
          ];
  
          url2.queryFeatures(query3).then(function (response) {
            console.log(response);
            response.features.forEach(function (feature, index) {
              var county = feature.attributes.County;
              var state = feature.attributes.STATE_NAME;
              $table.bootstrapTable('insertRow', {
                index: index,
                row: {
                  county: county,
                  state: state,
                }
                })
              Biden2020.push(feature.attributes.FIPS);
              let gfx = new Graphic({
                geometry: feature.geometry,
                attributes: {
                  PER_DEMOCRAT: feature.attributes.PER_DEMOCRAT,
                  PER_REPUBLICAN: feature.attributes.PER_REPUBLICAN,
                  county: feature.attributes.County,
                  state: feature.attributes.STATE_NAME,
                  ObjectId: index,
                },
              });
  
              graphics.push(gfx);
              if (index == response.features.length - 1) {
                resolve();
              }
            });
          });
        });
        createFinalData.then(() => {
          var fl = new FeatureLayer({
            title: "Trump to Biden Counties",
            source: graphics,
            objectIdField: "ObjectId",
            fields: [
              {
                name: "ObjectId",
                type: "oid",
              },
              {
                name: "state",
                type: "string",
              },
              {
                name: "county",
                type: "string",
              },
              {
                name: "PER_DEMOCRAT",
                type: "double",
              },
              {
                name: "PER_REPUBLICAN",
                type: "double",
              },
              {
                name: "medianAge",
                type: "double",
              },
            ],
            popupTemplate: {
              content:
                "State: {State} <br>" +
                "County: {County}% <br>" +
                "Percent Dem Vote: {medianAge}",
            },
            renderer: renderer1,
          });
          map.add(fl);
  
          console.log("map loaded");
        });
      }
      )
 
    });
  });
});
