<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" min-width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300" align="center" label="关键字">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.searchKey" size="large" />
          </template>
          <span v-else>{{ row.searchKey }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180" align="center" label="状态(0:开启,1:关闭)">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.keyStatus" size="large" />
          </template>
          <span v-else>{{ row.keyStatus }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180" align="center" label="排序">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.keyOrder" size="large" />
          </template>
          <span v-else>{{ row.keyOrder }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180" align="center" label="开始时间">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-date-picker v-model="row.startTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="timestamp" placeholder="Please pick a date" />
          </template>
          <span v-else>{{ row.startTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180" align="center" label="结束时间">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-date-picker v-model="row.endTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="timestamp" placeholder="选择结束时间" />
          </template>
          <span v-else>{{ row.endTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180" align="center" label="创建时间">
        <template slot-scope="{row}">
          <span>{{ row.createDate | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180" align="center" label="最后更新时间">
        <template slot-scope="{row}">
          <span>{{ row.updateDate | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" min-width="230">
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            size="small"
            icon="el-icon-refresh"
            type="warning"
            @click="cancelEdit(row)"
          >
            cancel
          </el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >
            Edit
          </el-button>
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            icon="el-icon-circle-check-outline"
            @click="confirmEdit(row)"
          >
            Ok
          </el-button>
          <el-button
            v-else
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete(row.id)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="新增" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="关键字" prop="searchKey">
          <el-input v-model="temp.searchKey" :autosize="{ minRows: 2, maxRows: 4}" type="input" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="状态" prop="keyStatus">
          <el-input v-model="temp.keyStatus" :autosize="{ minRows: 2, maxRows: 4}" type="number" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="排序" prop="keyOrder">
          <el-input v-model="temp.keyOrder" :autosize="{ minRows: 2, maxRows: 4}" type="number" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="temp.startTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="temp.endTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Please pick a date" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="createData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, updateHotkey, createHotkey, deleteHotkey } from '@/api/hotkeyApi'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'InlineEditTable',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    parseTime: parseTime
  },
  data() {
    return {
      list: null,
      listLoading: true,
      listQuery: {
        page: 0,
        limit: 20
      },
      dialogFormVisible: false,
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      temp: {
        id: undefined,
        searchKey: '',
        searchStatus: 0,
        searchOrder: 0,
        startTime: new Date(),
        endTime: new Date()
      },
      total: 0
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      const { data } = await fetchList(this.listQuery)
      const items = data.list
      this.list = items.map(v => {
        this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
        return v
      })
      this.total = data.total
      this.listLoading = false
    },
    cancelEdit(row) {
      row.title = row.originalTitle
      row.edit = false
      this.$message({
        message: 'The title has been restored to the original value',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      console.log(row)
      updateHotkey(row)
      this.$message({
        message: '更新成功',
        type: 'success'
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        searchKey: '',
        searchStatus: 0,
        searchOrder: 0,
        startTime: new Date(),
        endTime: new Date()
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async createData() {
      if (this.temp.searchKey.length === 0) {
        this.$message({
          message: '关键字不能为空',
          type: 'warning'
        })
      } else {
        await createHotkey(this.temp)
        this.dialogFormVisible = false
        this.getList()
        this.$message({
          message: '添加成功',
          type: 'success'
        })
      }
    },
    async handleDelete(id) {
      await deleteHotkey(id)
      this.getList()
      this.$message({
        message: '删除成功',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
