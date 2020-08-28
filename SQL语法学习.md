分组后取一条数据是一种非常常见的数据请求，那么相应的sql语句应该如何书写呢？

举例：
学生成绩表格，按照班级分组，取出每个班级的第一名。  
学生成绩表格，按照班级分组，取出每个班级的前10名。  

更加符合工业届的例子：
bilibili有30多个分区，取出每个分区中前三名的up主
知乎有多个话题分类，取出每个话题下的前三名组成知乎日报

更更常见的场景：
用户登陆信息记录表，每当用户登陆，都在这张表中记录一条信息。  
现在运营人员希望你能够提供 每个用户的最近一次登陆时间 便于他们进行数据分析和运营。

举了很多例子，你是不是对这种 sql 语句的编写场景有了一定认知呢，下面我们就以一个具体的例子和场景进行 sql 语句编写的训练。

1. 数据如下  

| name | dep | age |  
| ---    | ---   |--- |
| Bob  | 1     | 32  |
| Jill | 1     | 34  |
| Shawn| 1     | 42  |
| Jake | 2     | 29  |
| Paul | 2     | 36  |
| Laura| 2     | 39  |

dep 是 department 的缩写

2. 以 mysql 最新版数据库作为测试数据库
```bash
mysql> select version();
+-----------+
| version() |
+-----------+
| 8.0.21    |
+-----------+
1 row in set (0.00 sec)
```
3. 相关 DDL 和 DML 语句
```sql
create database my_test;

use my_test;

create table people
(
    id   int primary key auto_increment,
    name varchar(50),
    dep  int,
    age  int
);

insert into people (name, dep, age) values ("Bob", 1, 32);
insert into people (name, dep, age) values ("Jill", 1, 34);
insert into people (name, dep, age) values ("Shawn", 1, 42);
insert into people (name, dep, age) values ("Jake", 2, 29);
insert into people (name, dep, age) values ("Paul", 2, 36);
insert into people (name, dep, age) values ("Laura", 2, 39);
```

4. 终于来到了最激动人心的时刻，可以解决我们提出来的问题了

如何取出每个 department 中年龄最大的的用户
- 方案一
    ```
    select name, dep, age , row_number() over (partition by dep order by age desc )  as dep_rank from people

    然后

    select name, dep, age from (select name, dep, age , row_number() over (partition by dep order by age desc )  as dep_rank from people) as temp where temp.dep_rank=1

    ```

    点评：
    1. 该方案使用了 window function
    2. 如果多一条记录 `insert into people (name, dep, age) values ("Laura", 2, 39);` 发现使用该方法 dep 2 中年龄最大的人还是一个，而非两个

- 方案二
    ```sql
    select * from people as a left join people as b on a.dep=b.dep and a.age < b.age;
    然后
    select * from people as a left join people as b on a.dep=b.dep and a.age < b.age where b.age is null;
    然后
    select name, dep, age
    from (select a.*  from people as a left join people as b on a.dep=b.dep and a.age < b.age where b.age is null) as temp;
    ```
    
    点评：
    1. 该方案巧妙的的使用了 left join，但是显然将复杂度升高了，变为了 `n**2` 的复杂度。
    2. 该方案有效的保留了 dep 2 中两名年龄最大的用户 Laura 和 Michael。

- 方案三
    ```sql
    select max(age) from people group by dep;
    然后
    select *
    from people as a where a.age=(select  max(age) from people  as b  where a.dep=b.dep group by dep);
    ```
    
    点评：
    1. 非常精妙的一种写法，目前我还不懂这个 sql 语句 的执行流程，等将来学的更加深入了好好分析下这种写法。
    2. 同样保留了 dep 2 中两个年龄最大的数据。
    
- 方案三（another version）
    ```sql
    select dep, max(age) from people group by dep;

    select name, people.dep, age
    from people   join  (select dep, max(age) from people group by dep) as temp
    where people.dep = temp.dep
    and people.age = temp.`max(age)`
    ```
    
    点评：
    1. 使用 left join 会报错，使用 join 并不会，然而自己弄不懂为什么，看来对于 mysql 的语法学习还是要多练习，多思考呀。
    
## 参考链接
- stackoverflow:   
https://stackoverflow.com/questions/12102200/get-records-with-max-value-for-each-group-of-grouped-sql-results


