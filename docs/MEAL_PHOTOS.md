# 每餐图片接口

`POST /api/food-logs/{id}/photos`

使用现有 Supabase 登录的 `Authorization: Bearer <access_token>`。仅 `DASHBOARD_ALLOWED_USER_ID` 指定的用户可以写入。

请求为 `multipart/form-data`，包含 `role`（`before` / `after`）和 `file`（单张 JPG、PNG、WebP，最大 4,000,000 字节）。重复调用即可替换对应图片，另一张保持不变。

成功返回 `{id, photo_before_url, photo_after_url}`；错误状态为 400（参数）、401（登录）、403（非所有者）、404（记录不存在）、409（并发修改）、413（超限）、415（格式）、500（保存失败）。

图片使用 Vercel Blob，服务端读取 `BLOB_READ_WRITE_TOKEN`。只更新现有 `hrt.food_logs.photo_before_url` 或 `photo_after_url`，不改变表或视图结构。数据库写入失败时清理本次上传；替换成功后保留旧文件，避免其他引用失效。

缺失或加载失败的图片使用本地占位图，不向数据库写入占位 URL。每条摄入记录均可单独上传和替换。

验证：`node --test tests/meal-photos.test.mjs`。
