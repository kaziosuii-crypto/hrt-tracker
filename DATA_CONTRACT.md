# HRT Atlas 数据写入契约 v1

本项目不使用“所有东西都塞进统一时间轴”的数据模型。写入前必须先判断记录的自然粒度（grain），并写入对应实体。

## 核心原则

1. **按天（daily）**：一天最多一行。适用于当天汇总：睡眠、步数、饮水、是否暴食、活动、课程负荷等。`daily_lifestyle.record_date` 唯一。
2. **按摄入事件（event）**：一餐/一次加餐/一次饮料一行。适用于 `food_logs`。同一天允许多行。正餐数不能由人工维护的旧字段决定，应由当日 food_logs 中 早餐/午餐/晚餐 聚合得到；摄入事件数则统计全部 food_logs。
3. **按测量事件（measurement event）**：一次称重/体脂秤测量一行。适用于 `body_composition`。必须有实际 `measured_at` 才进入趋势；只有“近期约104kg”这类无日期回忆值只能作为背景事实，不进入时间趋势。
4. **按测量批次 + 指标 + 侧别（measurement batch × metric × side）**：适用于人体测量。一次 T0 可以产生多条底层指标，但 UI 必须按批次/身体区域/指标聚合，L/R 成对显示，不能把左右侧伪装成两次测量。
5. **按用药阶段（period）**：药物方案开始/结束形成一个 period，不按每天复制。适用于 `medication_periods`。
6. **按检验事件 + 检验项（lab event × analyte）**：同一次抽血/体检的多个项目共享采样时间/来源，但每个 analyte 独立一行。UI 按检验事件分组。
7. **长期基线（baseline/profile）**：例如“通常不吃早餐”“平时约睡6–7小时”“历史每周暴食1–2次”，不是某一天发生的事实，必须写入 `baseline_lifestyle` / `profile_facts`，禁止伪造成 daily row。

## 写入规则

- 不知道日期/时间时，不得为了能画时间轴而虚构时间。
- date-only 数据保持 date；只有确实知道具体时刻时才使用 timestamptz。
- `source`、`confidence`、`notes` 保留数据出处和不确定性。
- 原始值不覆盖；有校正时同时保留 raw/adopted/correction_rule。
- UI/分析层可以聚合，原始层不要为了 UI 重复存储同一个事实。
- 可从事件表可靠推导的日汇总（例如 meals、estimated_kcal_total）优先在 view/query 中计算，避免双写后失去一致性。

## 当前约定

### daily_lifestyle
- 主键之外以 `record_date` 为自然唯一键。
- 每天最多一行。
- `meals` 在展示层以 `food_logs` 当日早餐/午餐/晚餐数量为准。

### food_logs
- 一次摄入事件一行。
- `meal_type` 可为：早餐、午餐、晚餐、加餐、运动后加餐、饮料等。
- Dashboard 日汇总同时显示：正餐数、全部摄入事件数、当日估算总热量。

### body_composition
- 一次真实测量一行。
- `measured_at IS NULL` 的回忆/约数不得进入 `v_weight_trend`。
- date-only 来源导入时要保证本地日期不因 UTC 转换错一天。

### body_measurements
- 一次批次内，同一 metric 的 L/R 是同一个视觉指标的左右值，不是两条视觉记录。

## 给其他 AI 的最短指令

> 写 HRT Atlas 前先判断数据的自然粒度：长期基线→baseline/profile；每日汇总→daily_lifestyle（每天唯一一行）；每餐/饮料→food_logs（每次摄入一行）；每次称重→body_composition；一次人体测量→按 batch+metric+side 写 body_measurements；用药变化→medication_periods；化验→按采样事件+检验项写 lab_results。不要为了统一时间轴虚构时间，不要把可聚合数据重复手填；原始值、来源、可信度必须保留。
