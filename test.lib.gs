function test_queryss(){
  var id = '1-EGE1jVK-2zW_Hg5yHDLQThmsCzP3WWoPTe0oQOQj_U';
  
  var result = SELECT().FROM(id).WHERE({ 'メールアドレス' : 'tawatsu@c-fo.com'} );
  
  Logger.log(result);
}


