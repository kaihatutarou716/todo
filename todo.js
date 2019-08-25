//-----------------------------共通処理-----------------------------

//XHRのオブジェクト作成
var XMLHttpFactories = [
  function () {
    return new ActiveXObject("Msxml2.XMLHTTP")
  },
  function () {
    return new ActiveXObject("Microsoft.XMLHTTP")
  },
  function () {
    return new ActiveXObject("Msxml3.XMLHTTP")
  },
  function () {
    return new XMLHttpRequest()
  }
];

//XHRのオブジェクト作成
function createXMLHttpObject() {
  var xmlhttp = false;
  for (var i = 0; i < XMLHttpFactories.length; i++) {
    try {
      xmlhttp = XMLHttpFactories[i]();
    } catch (e) {
      continue;
    }
    break;
  }
  return xmlhttp;
}

//新規jsonファイル作成
function createJsonData() {
  var dirPath = location.pathname;

  //先頭文字が"/"だった場合の対策
  if (dirPath.substring(0, 1) == "/") {
    dirPath = dirPath.substring(1, dirPath.length);
  }

  dirPath = dirPath.substring(0, dirPath.lastIndexOf("/")) + "/";
  var filename = dirPath + dataFileName;

  var ua = navigator.userAgent.toLowerCase();
  try {

    //ieの場合
    if (ua.indexOf("ie")) {

      var fso = new ActiveXObject("Scripting.FileSystemObject");

      //ファイル存在チェック
      if (!(fso.FileExists(filename))) {

        //jsonデータの初期値
        var JsonData = '{"data":[],"dataInfo":[{"sortId":1}]}';

        //OpenTextFileの引数：対象のファイルパス、書き込み、新規作成、UTF-16 　
        var file = fso.OpenTextFile(filename, 2, true, -1);
        file.Write(JsonData);
        file.Close();
        location.reload();
      }
    } else {
      alert("IE以外対応していません");
    }
  } catch (e) {
    alert("Error: " + e);
  } finally { }
}

//ソート処理
function sortJsonData(Jsondata) {
  var data = Jsondata.data

  var sortValue = 1;
  sortValue = Jsondata.dataInfo[0].sortId;

  //期限：昇順、ID：昇順順に表示
  if ((sortValue === undefined || sortValue === null) || (sortValue == 1)) {
    data.sort(function (a, b) {
      if (a.deadLine < b.deadLine) return -1;
      if (a.deadLine > b.deadLine) return 1;
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
    })

    //期限：降順、ID：昇順順に表示
  } else if (sortValue == 2) {
    data.sort(function (a, b) {
      if (a.deadLine < b.deadLine) return 1;
      if (a.deadLine > b.deadLine) return -1;
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
    })

    //状態：作業中、ID：昇順順に表示
  } else if (sortValue == 3) {
    data.sort(function (a, b) {
      if (a.state < b.state) return -1;
      if (a.state > b.state) return 1;
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
    })

    //状態：完了、ID：昇順順に表示
  } else if (sortValue == 4) {
    data.sort(function (a, b) {
      if (a.state < b.state) return 1;
      if (a.state > b.state) return -1;
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
    })
  }

  Jsondata.data = data
  return Jsondata;
}

//jsonデータ取得
function getJsonData() {
  var JsonData = "";
  var xmlhttp = createXMLHttpObject();
  xmlhttp.onreadystatechange = function () {

    //ステータスが4の場合、jsonデータを取得
    if (xmlhttp.readyState == 4) {
      JsonData = JSON.parse(xmlhttp.responseText);
      JsonData = sortJsonData(JsonData);
    }
  }
  xmlhttp.open("GET", dataFileName);
  xmlhttp.send();

  return JsonData;
}

//jsonデータ変更
function writeJsonData(filename, content) {
  var dirPath = location.pathname;

  //先頭文字が"/"だった場合の対策
  if (dirPath.substring(0, 1) == "/") {
    dirPath = dirPath.substring(1, dirPath.length);
  }

  dirPath = dirPath.substring(0, dirPath.lastIndexOf("/")) + "/";
  filename = dirPath + filename;

  var ua = navigator.userAgent.toLowerCase();
  try {

    //ieの場合
    if (ua.indexOf("ie")) {
      var fso = new ActiveXObject("Scripting.FileSystemObject");

      //OpenTextFileの引数：対象のファイルパス、書き込み、新規作成、UTF-16 　
      var file = fso.OpenTextFile(filename, 2, true, -1);
      file.Write(content);
      file.Close();
    } else {
      alert("IE以外対応していません");
    }
  } catch (e) {
    alert("Error: " + e);
  } finally {
    location.reload();
  }
}

//-----------------------------ボタン処理-----------------------------

//ソート処理(期限）
$(function () {
  $(document).on("click", "#dieButton", function (e) {

    var JsonData = "";
    var sortValue = 1;
    JsonData = getJsonData();
    sortValue = JsonData.dataInfo[0].sortId;

    //1:昇順、2:降順
    if (sortValue == 1) {
      JsonData.dataInfo[0].sortId = 2;
    } else {
      JsonData.dataInfo[0].sortId = 1;
    }
    writeJsonData(dataFileName, (JSON.stringify(JsonData)));

  });
});

//ソート処理(ステータス）
$(function () {
  $(document).on("click", "#steButton", function (e) {

    var JsonData = "";
    var sortValue = 1;
    JsonData = getJsonData();
    sortValue = JsonData.dataInfo[0].sortId;

    //3:作業中、4:完了
    if (sortValue == 3) {
      JsonData.dataInfo[0].sortId = 4;
    } else {
      JsonData.dataInfo[0].sortId = 3;
    }
    writeJsonData(dataFileName, (JSON.stringify(JsonData)));
  });
});

//データ追加
function submitItem() {

  var FormTask = document.forms.inputForm_id.item.value;
  var FormCalendar = document.forms.inputForm_id.datepicker.value;

  if ((FormTask == "") || (FormTask == null)) {

    alert("タスク名を入力してください");
    return;
  }

  if ((FormCalendar == "") || (FormCalendar == null)) {

    alert("期限を入力してください");
    return;
  }

  var JsonData = "";
  var maxId = 0;
  JsonData = getJsonData();

  var numArray = new Array();
  for (var j = 0; j < JsonData.data.length; j++) {
    numArray.push(JsonData.data[j].id);
  }

  //Idは最大値+1を設定
  if (numArray.length >= 1) {
    maxId = (Math.max.apply(null, numArray)) + 1;
  } else {
    maxId = 1;
  }

  //データ作成
  var obj = new Object();
  obj.id = maxId;
  obj.task = FormTask;
  obj.deadLine = FormCalendar;
  obj.state = 1;
  obj.memo = "";
  JsonData["data"].push(obj);
  writeJsonData(dataFileName, (JSON.stringify(JsonData)));
}

//ステータス更新処理
$(function () {
  $(document).on("click", "#stateButton", function (e) {
    var id = $(this).val();

    var JsonData = "";
    JsonData = getJsonData();

    //取得したidに対応するステータス値を変更
    for (var j = 0; j < JsonData.data.length; j++) {
      if (JsonData.data[j].id == id) {
        if (JsonData.data[j].state == 1) {
          JsonData.data[j].state = 2;
        } else if (JsonData.data[j].state == 2) {
          JsonData.data[j].state = 1;
        }
        break;
      };
    }
    writeJsonData(dataFileName, (JSON.stringify(JsonData)));
  });
});

//メモ追加・編集
$(function () {
  $(document).on("click", "#memoButton", function (e) {
    var id = $(this).val();

    var JsonData = "";
    var i = -1;
    JsonData = getJsonData();

    //一致するjson配列のインデックスを取得
    i = JsonData.data.reduce(function (prev, item, index, array) {
      if (item.id == id) {
        prev.push(index);
      }
      return prev;
    }, []);

    //ダイヤログ入力完了後、jsonデータ更新
    $(function () {
      var editObj = new dataInfo(false);
      var dialog = dialogProcess(editObj);
      dialog.done(function () {
        if (editObj.getEditFlg()) {
          JsonData.data[i].memo = memoArea.innerText;
          writeJsonData(dataFileName, (JSON.stringify(JsonData)));
        }
      });
    });

    var dialogProcess = function (editObj) {
      var defer = $.Deferred();
      var memoArea = document.getElementById("memoArea_id");
      memoArea.innerText = JsonData.data[i].memo;

      //入力ダイヤログ
      $("#div_memoArea").dialog({
        dialogClass: 'memoAreaTitle',
        modal: true, //モーダル表示
        title: "追加・編集",
        width: 600, //ダイアログの横幅(px)
        height: 400, //ダイアログの縦幅(px)

        buttons: [{
          text: "確定",
          class: "maBtnOk",
          click: function () {
            editObj.setEditFlg(true);
            $(this).dialog("close");
            defer.resolve();
          }
        },
        {
          text: "キャンセル",
          class: "maBtnNg",
          click: function () {
            $(this).dialog("close");
            defer.resolve();
          }
        }
        ]
      });

      // プロミスを作って返す 
      return defer.promise();
    };
  });
});

//データ削除処理
$(function () {

  //削除対象のid取得
  $(document).on("click", "#deleteButton", function (e) {
    var id = $(this).val();

    var JsonData = "";
    var i = -1;
    JsonData = getJsonData();

    //一致するjson配列のインデックスを取得
    i = JsonData.data.reduce(function (prev, item, index, array) {
      if (item.id == id) {
        prev.push(index);
      }
      return prev;
    }, []);

    //jsonから対象データ削除処理
    JsonData.data.splice(i, 1);
    writeJsonData(dataFileName, (JSON.stringify(JsonData)));
  });
});