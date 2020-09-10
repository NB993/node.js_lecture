var M = {
    v : "v",
    f : function() {
        console.log(this.v);
    }
}

module.exports = M; //mpart.js이 갖고 있는 여러 기능중 M이라는 녀석을 외부로 export해서 사용할 수 있게 함.