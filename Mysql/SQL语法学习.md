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
    ```
    原因是 join on 语法，而不要使用 join where 语法  
    难道是存在 join where 这种写法，但是没有 left join where 这种写法？
    改成 join on 语法 比较 left join 和 join 你就会明白原因了
    
    select *
    from people
             left join (select dep, max(age) from people group by dep) as temp
    on people.dep = temp.dep
      and people.age = temp.`max(age)`
    

    感觉自己找到了原因根本原因是
    select * from people join (select * from people) as temp; 这句话能够运行成功
    select * from people left join (select * from people) as temp; 这句话运行失败

    so why？绕了一圈又回到了 mysql 语法解析器上，看来要真正学会 mysql 语法，必须要对 mysql 语法解析器 有一定了解了。


    ```

- 方案四
    类似 方案一，只不过采用了 CTE 方式
   ```sql
    with row_number_table as
         (select name,
                 dep,
                 age,
                 row_number() over (partition by dep
                     order by age desc) as RN
          from people)
    select name, age
    from row_number_table
    where RN = 1
   ``` 

- 方案五
    类似方案一，只不过采用了 User-Defined Variable
    ```sql
    select *
    from (
            select @rn := case when dep != @prev_dep THEN 1 ELSE @rn + 1 End as rn,
                    @prev_dep := dep,
                    name,
                    age,
                    dep
            from people,
                (select @rn := 0) as r

            order by dep, age desc, name) as temp
    where rn = 1;



    ```
    解释如下：
    ```sql
    1. select * from people, (select @rn := 0) as r    形成 两张表的join
    2. @prev_dep 没有初始化，直接拿来使用了，所以 prev_dep 初始值为 NULL

    接着对每一行数据进行如下操作

    3. @rn := case when dep != @prev_dep THEN 1 ELSE @rn + 1 End    这是个三元表达式
    4. @prev_dep := dep

    生成一张表，对最后的结果使用 filter 过滤

    5. where rn=1


    ```
    
    更多思考：
    ```
    请问下面的语句能不能实现 同样的功能？
    select @rn := case when dep != @prev_dep THEN 1 ELSE @rn + 1 End as rn,
       @prev_dep := dep,
       name,
       age,
       dep
    from people,
        (select @rn := 0) as r
    having rn=1
    order by dep, age desc, name
    ```
    
## 参考链接
- stackoverflow:   
https://stackoverflow.com/questions/12102200/get-records-with-max-value-for-each-group-of-grouped-sql-results


