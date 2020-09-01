# 入门
The DESCRIBE and EXPLAIN statements are synonyms, used either to obtain information about table structure or query execution plans.

# 数据
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
insert into people (name, dep, age) values ("Laura", 2, 39);
```

# 演示
1. explain table

可以看到使用 `explain people` 可以看到 table structure。
```bash
mysql> explain people;
+-------+-------------+------+-----+---------+----------------+
| Field | Type        | Null | Key | Default | Extra          |
+-------+-------------+------+-----+---------+----------------+
| id    | int         | NO   | PRI | NULL    | auto_increment |
| name  | varchar(50) | YES  |     | NULL    |                |
| dep   | int         | YES  |     | NULL    |                |
| age   | int         | YES  |     | NULL    |                |
+-------+-------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)
```

2. explain select

使用 `explain select` 可以得到一个 12 列表格，代表了 query execution plan (QEP 执行计划)。
```bash
mysql> explain select * from people;
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table  | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | people | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    7 |   100.00 | NULL  |
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------+
1 row in set, 1 warning (0.00 sec)
```

3. explain update
```bash
mysql> explain
    -> update people
    -> set age=55
    -> where id = 1;
+----+-------------+--------+------------+-------+---------------+---------+---------+-------+------+----------+-------------+
| id | select_type | table  | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra       |
+----+-------------+--------+------------+-------+---------------+---------+---------+-------+------+----------+-------------+
|  1 | UPDATE      | people | NULL       | range | PRIMARY       | PRIMARY | 4       | const |    1 |   100.00 | Using where |
+----+-------------+--------+------------+-------+---------------+---------+---------+-------+------+----------+-------------+
1 row in set, 1 warning (0.00 sec)
```

```
值得注意的地方有两点：
1. explain 也是可以解释 update 的执行计划的
2. explain 单纯只是解释 sql 语句，但是没有执行 sql 语句，这句 update sql 并没有被执行。
```


