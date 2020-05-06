v-bind:key 出现的场景

```html
    <div id="app">
        <div>
            <input type="text" v-model="name">
            <button @click="add">添加</button>
        </div>
        <ul>
            <li v-for="(item, i) in list">
                <input type="checkbox"> {{item.name}}
            </li>
        </ul>
    </div>
    <script>
        // 创建 Vue 实例，得到 ViewModel
        var vm = new Vue({
            el: '#app',
            data: {
                name: '',
                newId: 3,
                list: [
                    { id: 1, name: '李斯' },
                    { id: 2, name: '吕不韦' },
                    { id: 3, name: '嬴政' }
                ]
            },
            methods: {
                add() {
                    //注意这里是unshift
                    this.list.unshift({ id: ++this.newId, name: this.name })
                    this.name = ''
                }
            }
        });
    </script>
```