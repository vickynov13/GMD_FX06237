const express=require('express');
const app=express();
const port= 8080;
const FlatDB=require('flat-db');
var bodyParser=require('body-parser');

FlatDB.configure({
  dir: './storage',
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((Request,Response,next)=>{
  Response.append('Access-Control-Allow-Origin', ['*']);
  Response.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  Response.append('Access-Control-Allow-Headers', 'Content-Type,skey,uid,sterm,gname,upd');
    next();
});

const trainStat=new FlatDB.Collection('trains', {
  runStatus: 0,
  speed: 0,
  headLamp: 0,
  comp1light: 0,
  comp2light: 0,
  comp3light: 0,
  lastCorssedCheck: 0,
  lastStoppedCheck: 0,
  nextCheck: 0,
  nextStop: 0,
  totalCheck: 0
});;
var keys = trainStat.add([{}]);
var key;
const bootHandler = async function (){
  console.log("bootloader");
  
  trainStat.reset();
  keys=trainStat.add([
    {
      runStatus: 0,
      speed: 80,
      headLamp: 0,
      comp1light: 0,
      comp2light: 0,
      comp3light: 0,
      lastCorssedCheck: 0,
      lastStoppedCheck: 0,
      nextCheck: 0,
      nextStop: 0,
      totalCheck: 0
    },
  ]);
  key=keys[0];
};

app.listen(port, ()=> {
  console.log(`App running on port ${port}`)
})

app.get('/', (req, res)=> {
  res.send(key)
})

app.get('/resetall', (req, res)=> {
    bootHandler();
    res.send(key)
  })

app.get('/status', (req, res)=> {
  let tstat=trainStat.get(key);
  if(tstat.runStatus > 1){
    tstat.runStatus = 1;
    trainStat.update(key, tstat);
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
        return res.send(trainStat.get(key));
});

app.get('/speed/:item', (req, res)=> {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  let tstat=trainStat.get(key);
  if(tstat.runStatus >= 1){
    tstat.runStatus = 1;
    if(req.params.item == 'up'){
      var upspd = tstat.speed + 20;
      if(upspd >= 255){
        tstat.speed = 255;
      }else{tstat.speed = upspd;}
    }else if(req.params.item == 'down'){
      var lowspd = tstat.speed - 20;
      if(lowspd <= 160){
        tstat.speed = 160;
      }else{tstat.speed = lowspd;}
    }
  }
  trainStat.update(key, tstat);
  return res.send(tstat);
});

app.get('/set/:item', (req, res)=> {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  let tstat=trainStat.get(key);
  if(tstat.runStatus > 1){
    tstat.runStatus = 1;
  }
  if(req.params.item == 'speed'){
    if(tstat.runStatus == 1){
      if(req.query.value >=160 && req.query.value <=255){
        tstat.speed=Number(req.query.value);
      }
    }
  }
  if(req.params.item == 'runStatus'){
    if(req.query.value == 0){
      tstat.speed = 100;
      tstat.runStatus = 0;
    }else if(req.query.value == 1 && tstat.runStatus == 0){
      tstat.speed = 160;
      tstat.runStatus = 2;
    }
  }
  if(req.params.item == 'headLamp'){
    if(req.query.value == 0){
        tstat.headLamp = 0;
    }else{ tstat.headLamp = 1;}
  }
  if(req.params.item == 'comp1light'){
    if(req.query.value == 0){
        tstat.comp1light = 0;
    }else{ tstat.comp1light = 1;}
  }
  if(req.params.item == 'comp2light'){
    if(req.query.value == 0){
        tstat.comp2light = 0;
    }else{ tstat.comp2light = 1;}
  }
  if(req.params.item == 'comp3light'){
    if(req.query.value == 0){
        tstat.comp3light = 0;
    }else{ tstat.comp3light = 1;}
  }
  trainStat.update(key, tstat);
  return res.send(tstat);
});