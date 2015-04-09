/**
 * Created by JBH on 2015/3/24.
 * Model
 * 采用JS构造函数模式创建对象
 */
function Post(name, head, title, tags, post){
    this.name = name;
    this.head = head;
    this.title = title;
    this.tags = tags;
    this.post = post;
}

module.exports = Post;