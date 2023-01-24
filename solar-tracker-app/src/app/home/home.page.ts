import { Component } from "@angular/core";
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { NavController } from "@ionic/angular";
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
   
  chartDom;
  myChart:echarts.ECharts;

  chartDom2;
  myChart2:echarts.ECharts;
  data=[];


  degree="-";
  weatherText="Sunny";
  weatherControl="sunny";
  textControl=1;
  rain=0;
  _lastData:number;
  avgData;
  sumData=0;
  lastDatacolor;


  
  constructor(private fireDb:AngularFireDatabase,private router: Router, private socket: Socket,private nav:NavController) {
 



    document.body.setAttribute('color-theme','dark');
    this.getRealTimeTemp();
    setTimeout(() => {
     this.lastDatacolor=document.getElementById('lastDataColor');
      
      this.chartDom= document.getElementById('main');
      this.myChart=echarts.init(this.chartDom, '');

      this.chartDom2= document.getElementById('main2');
      this.myChart2=echarts.init(this.chartDom2, '');
      this.myChart.showLoading();
         this.getData();
    }, );
   
  }

  settings()
  {
    // this.router.navigate(['/settings']);
    this.nav.navigateForward('settings');
  }

  getRealTimeTemp()
  {
    this.fireDb.database.ref('Temp').on('value',data=>{
     this.degree=parseFloat(data.val()).toFixed(1);
    });
  }

  _line=" ";
  date;
  weather(date)
  {

  
  //  console.log((this.data[this.data.length-1]['value'][0]));
  //  console.log((this.data[this.data.length-1]['value'][1]));


  var parseDate=date.slice(10,12);

   if(this.rain==1)
   {
     this.weatherText="Rainy";
     this.weatherControl="rainy";
     this.textControl=0;
   }
   else if(this._lastData>1.5)
   {
    this.weatherText="Sunny";
    this.weatherControl="sunny";
    this.textControl=1;
   }
   else if((parseDate<20 && parseDate>=6)  && this._lastData<=1.5)
   {
    this.weatherText="Cloudy";
    this.weatherControl="cloudy";
    this.textControl=1;
   }
   else if((parseDate>=20 || parseDate<6)  && this._lastData<=1)
   {
    this.weatherText="Clear";
    this.weatherControl="night";
    this.textControl=1;
   }
 
  }

  getData()
  {

    var  tempArray=[];

    //parse data

    // myChart.showLoading();
    // myChart.hideLoading();
 
    this.fireDb.database.ref('data').once('value',data=>{
      tempArray.push(data.val());
    }).then(()=>{
      for (let index = 0; index < tempArray.length; index++) {
        var id= Object.keys(tempArray[index]);
        for (let i = 0; i < Object.keys(tempArray[index]).length; i++) {
        //  this.datas.push(test[index][id[i]]);
            // console.log(tempArray[index][id[i]]['date']);
            // console.log(tempArray[index][id[i]]['volt']);
            var temp=[];

            temp.push(tempArray[index][id[i]]['date']);
            temp.push(tempArray[index][id[i]]['volt']);
            this.sumData+=tempArray[index][id[i]]['volt'];
            this.data.push({value:temp});
         }
        }
    }).then(()=>{
      console.log(this.data);
      // this.pageControl=1;
        this.myChart.hideLoading();
        // console.log(this.avgData);
        console.log(this.data.length);
        console.log(this._lastData);

        this._lastData=this.data[this.data.length-1]['value'][1].toString().slice(0,4);;
        this.avgData=(this.sumData/this.data.length).toString().slice(0,4);
        var date=this.data[this.data.length-1]['value'][0];
        this.weather(date);

        console.log(this.avgData);
        this.myChart.setOption<echarts.EChartsOption>({
          series: [
            {
              data: this.data
            }
          ]
        });

        this.myChart2.setOption<echarts.EChartsOption>({
          series: [
            {
              data: this.data
            }
          ]
        });

    })

    //getRealTime
    this.fireDb.database.ref('data').on('value',data=>{
      this.getRealTime();
      })


  }
 _bar="bar";

 changeChart(e)
 {
    if(e.detail.value=='line')
    this.switchLine()
    else
    this.switchBar()
 }

 switchLine()
{
  var line=document.getElementById('line');
  var bar=document.getElementById('bar');

this._bar='slide-out-left'

setTimeout(() => {
  this._line='slide-in-right'; 

}, 400);
setTimeout(() => {
  line.style.display="block";
   bar.style.display='none';

}, 400);
}

  switchBar()
  {


    var x=document.getElementById('line');
    var y=document.getElementById('bar');

    this._line='slide-out-right'; 
setTimeout(() => {
  
  this._bar='slide-in-left'
}, 400);
setTimeout(() => {
  x.style.display='none';
  y.style.display='block';
  
}, 400);



    // var data=this.data;
    // this.data=[];
    // for (let index = 0; index < 20; index++) {
    //    console.log((data[index]['value'])[0])
    //    console.log((data[index]['value'])[1])
    //     //  var x={(data[index]['value'])[0])volt:(data[index]['value'])[1]};
    //     var x=[];
    //     x.push((data[index]['value'])[0]);
    //     x.push((data[index]['value'])[1])

    //    this.data.push({value:x});
           
    // }
   
    //   this.myChart.setOption<echarts.EChartsOption>({
    //     series: [
    //       {
    //         data: this.data
    //       }
    //     ]
    //   });
 
 
  }
 
 counter=0;
 
 getRealTime()
 {
  if(this.counter>0)
  {
    var  tempArray=[];
     //parse data
     this.fireDb.database.ref('data').once('value',data=>{
       tempArray.push(data.val());
     }).then(()=>{
          
        //get last data
         var id= Object.keys(tempArray[tempArray.length-1]);
             // console.log(test[index][id[i]]['date']);
             // console.log(test[index][id[i]]['volt']);
             var temp=[];
            temp.push(tempArray[0][id[id.length-1]]['date']);
            temp.push(tempArray[0][id[id.length-1]]['volt']);
            
            this.lastData(tempArray[0][id[id.length-1]]['volt']);
            this.sumData+=tempArray[0][id[id.length-1]]['volt'];
            this.rain=tempArray[0][id[id.length-1]]['rain'];
            this.data.push({value:temp});
            var date=tempArray[0][id[id.length-1]]['date'];
            this.weather(date);

            this.avgData=(this.sumData/this.data.length).toString().slice(0,4);
             
     }).then(()=>{
         
         this.myChart.setOption<echarts.EChartsOption>({
           series: [
             {
               data: this.data
             }
           ]
         });
         this.myChart2.setOption<echarts.EChartsOption>({
          series: [
            {
              data: this.data
            }
          ]
        });
     })
  }

  this.counter=1;

 }

 lastData(data)
 {
   if(this._lastData<data)
   {
     this._lastData=data.toString().slice(0,4);;
    this.lastDatacolor.style.color='#29c467';
   }
   else
   {
    this._lastData=data.toString().slice(0,4);;
    this.lastDatacolor.style.color='#e04055';
   }


 }
 
 

 lineOption:EChartsOption = {
  // title: {
  //   left: 'center',
  // text: 'Voltage'
  // },
  tooltip: {
    trigger: 'axis',
    // position: function (pt) {
    //   return [pt[0], '10%'];
    // },
    
    // axisPointer: {
    //   animation: false
    // }
  },
  xAxis: {
    type: 'time',

    // type: 'category',
    // boundaryGap: true,
  

    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '10%'],
    show:true,
    splitLine: {
      show: true
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 80,// 
      end: 100// 
      ,
     minSpan:0.5,
    } 
  ],
  series: [
    {
      name: 'Volt',
      type: 'line',
      showSymbol: false,
      smooth: true,
      itemStyle: {
         color: '#ffd3a5' 
      },
      // areaStyle: {
      //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      //     {
      //       offset: 0,
      //       color: '#ffd3a5' 
      //     },
      //     {
      //       offset: 1,
      //       color: '#2b2d3e'//background
      //     }
      //   ])
      // },
      data: this.data
    }
  ]
};

 

barOption:EChartsOption = {
  // title: {
  //   left: 'center',
  // text: 'Voltage'
  // },
  tooltip: {
    trigger: 'axis',
    // position: function (pt) {
    //   return [pt[0], '10%'];
    // },
    
    // axisPointer: {
    //   animation: false
    // }
  },
  xAxis: {
    type: 'time',

    // type: 'category',
    // boundaryGap: false,

    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '10%'],
    show:true,
    splitLine: {
      show: true
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 80,// 
      end: 100// 
      ,
      // minSpan:0.2,
      
      
    } ,
    
  ],
  series: [
    {
      name: 'Volt',
      type: 'bar',
   
    
      itemStyle: {
        color: '#ffd3a5' 
      },
      
      data: this.data
    }
  ]
};

//  chartOption: EChartsOption = {
//    tooltip: {
//      trigger: 'axis',
//      position: function (pt) {
//        return [pt[0], '10%'];
//      }
//    },
//    title: {
//      left: 'center',
//      text: 'Large Ara Chart'
//    },
//    toolbox: {
//      feature: {
//        dataZoom: {
//          yAxisIndex: 'none'
//        },
//        restore: {},
//        saveAsImage: {}
//      }
//    },
//    xAxis: {
//      type: 'time',
//      boundaryGap: false
//    },
//    yAxis: {
//      type: 'value',
//      boundaryGap: [0, '100%']
//    },
//    dataZoom: [
//      {
//        type: 'inside',
//        start: 0,
//        end: 20
//      },
//      {
//        start: 0,
//        end: 20
//      }
//    ],
//    series: [
//      {
//        name: 'Fake Data',
//        type: 'line',
//        smooth: true,
//        symbol: 'none',
//        areaStyle: {},
//        data: this.data
//      }
//    ]
   
//  };
 
}


 
