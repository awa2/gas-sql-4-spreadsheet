var _ = Underscore.load(); // from Underscore Library

var SELECT = function(selector){
  return new SELECT.prototype.init(selector);
}
SELECT.prototype = {
  init : function(selector){
    this.exec = (Date.now())*10^12;
    this.took = 0;
    if(!selector){ this.selector = '*' };
    this.selector = selector;
    
    this.data = [];
    this.joindata = [];
    
    return this;
  },
  FROM : function(id,sheet){
    var self = this;
    
    if(!id){ return false; };
    this.id   = id;
    this.sheet = sheet;
    
    this.file = DriveApp.getFileById(id);
    this.lastUpdated = this.file.getLastUpdated();
    this.created = this.file.getDateCreated();
    
    var rawdata = this.getDataFromSpreadSheet(id,sheet); // this.ss   = SpreadsheetApp.openById(id);
    this.index = _.head(rawdata);
    this.body = _.rest(rawdata);
    
    this.data = _.map(rawdata,function(record){
      return _.object(self.index,record);
    });
    
    this.calcTookTime();
    return this;
  },
  
  
  // OPTIONAL
  
  // WHERE
  //   SELECT().FROM(id).WHERE(function(item){return item.name == 'taro'});
  //   SELECT().FROM(id).WHERE({ name : 'taro' });
  WHERE : function(predicate){
    switch(typeof predicate){
      case 'function' :
        this.data = _.filter(this.data,predicate);
        return this;
        break;
      case 'object' :
        this.data = _.where(this.data,predicate);
        return this;
        break;
      default :
        break;
    }
    
    this.calcTookTime();
    return this;
  },
  
  // JOIN
  //   SELECT().FROM(id).JOIN(id).USING('name');
  //   SELECT().FROM(id).JOIN(id).ON('name','username');
  // * INNNER_JOIN() is alias for JOIN()
  // * not support CROSS JOIN
  JOIN : function(id,sheet){
    this.joinmode = 'inner';
    this.joinid = id;
    this.joinsheet = sheet;
  },
  INNER_JOIN : function(id,sheet){ return this.JOIN(id,sheet); },
  
  // OUTER JOIN
  LEFT_OUTER_JOIN : function(id,sheet){
    this.joinmode = 'left';
    this.joinid = id;
    this.joinsheet = sheet;
  },
  LEFT_JOIN : function(id,sheet){ return this.LEFT_OUTER_JOIN(id,sheet); },
  RIGHT_OUTER_JOIN : function(id,sheet){},
  RIGHT_JOIN : function(id,sheet){ return this.RIGHT_OUTER_JOIN(id,sheet); },
  
  ON : function(key1,key2){
    var self = this;
    
    var joindata = this.getDataFromSpreadSheet(this.joinid,this.joinsheet);
    this.joinindex = _.head(joindata);
    this.joindata = _.map(joindata,function(record){
      return _.object(self.joinindex,record)
    });    
    var result = [];
    
    switch(this.joinmode){
      case 'inner':
        result = _.map(this.data,function(obj){            // obj -> {name : 'taro', age : 30} from data;
          var property = {};
          property[key2] = obj[key1];                      // property -> { username : 'taro' } when given ('name','username') as args;
          var result = _.findWhere(self.joindata,property) // result -> { username : 'taro', role : 'engineer'} from joindata;
          if(result){
            return _.extend(obj,result)                    // return -> { name : 'taro', age : 30, username : 'taro', role : 'engineer' }
          } else {
            return false;                                  // if findWhere method has failed, 'false' return
          }
        });
        result = _.compact(result);                        // delete 'false' element on array
        break;
        
      case 'left':
        result = _.map(this.data,function(obj){            // obj -> {name : 'taro', age : 30} from data;
          var property = {};
          property[key2] = obj[key1];                      // property -> { username : 'taro' } when given ('name','username') as args;
          var result = _.findWhere(self.joindata,property) // result -> { username : 'taro', role : 'engineer'} from joindata;
          if(result){
            return _.extend(obj,result)                    // return -> { name : 'taro', age : 30, username : 'taro', role : 'engineer' }
          } else {
            var nilprop = _.object(self.joinindex,[undefined]);     // index -> ['username','role']
            return _.extend(obj,nilprop);                  // return -> { name : 'taro', age : 30, username : undefined, role : undefined }
          }
        });
        break;
      case 'right':
        
        break;
    }
    
  },
  USING : function(key){
    return this.ON(key,key);
  },
  
  // OUTPUT
  
  // INTO
  //   SELECT().FROM(id).INTO(id);
  INTO : function(id,sheet){
  },
  toObject : function(){
  
  },
  $ : function(){
    if(this.selector !== '*'){
      switch(typeof this.selector){
        case 'string' :
          this.data = _.pluck(this.data,propertyName);// why pluck?
          break;
        case 'object' :
          if(Array.isArray(selector)){
            this.data = _.map(this.data,function(obj){ return _.pick(obj,selector); });
          } else {
            this.data = _.where(this.data,selector);
          }
          break;
        default :
          break;
      }
    }
    return {
      status : 'success',
      result : this.data,
      took : this.took - (Date.now())*10^12
    }
  },
  
  // private method
  calcTookTime : function(){
    this.took = (Date.now())*10^12 - this.exec;
  },
  getDataFromSpreadSheet : function(id,sheet){
    return this.autoSelectSheet(id,sheet).getDataRange().getValues();
  },
  setDataIntoSpreadSheet : function(data,id,sheet){
    var sheet = this.autoSelectSheet(id,sheet);
    sheet.setValues// wip
    _.map(data,_.values)
  },
  autoSelectSheet : function(id,sheet){
    var ss = SpreadsheetApp.openById(id);
    switch(typeof sheet) {
      case 'string' :
        return ss.getSheetByName(sheet);
        break;
      case 'number' :
        return ss.getSheets()[sheet];
        break;
      default :
        return ss.getSheets()[0];
        break;
    }
  },
  autoAddSheet : function(id,sheetName){
    var ss = SpreadsheetApp.openById(id);
    if(sheetName){
      return ss.insertSheet(sheetName);
    } else {
      return ss.insertSheet();
    }
  }
}

SELECT.prototype.init.prototype = SELECT.prototype;


