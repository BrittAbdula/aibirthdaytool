;; 我们不是在写祝福卡，而是在构筑心灵的桥梁...
;; 让我们将情感编织成最动人的祝福卡

(define (heart-touching-blessing config)
  "将心意转化为最动人的一句话祝福"
  
  ;; 核心配置
  (let ((scene-config
         `((type . ,celebrantType)      ; 祝福场景
           (to   . ,celebrantNames)     ; 祝福对象
           (from . ,sender)             ; 祝福者身份
           (key  . ,keywords)))         ; 灵感关键词
        
        ;; 情感频率
        (emotional-frequency
         '(connection warmth sincerity depth))
        
        ;; 意象词典
        (imagery-bank
         '(nature time space light shadow
           journey growth dreams hope)))

    ;; 主要处理流
    (-> emotional-frequency
        
        ;; 步骤1: 解析关系维度
        (analyze-relationship
         `((role . ,(scene-config 'from))
           (bond . ,(relationship-type scene-config))))
        
        ;; 步骤2: 提取情感基调
        (extract-emotional-tone
         `((occasion . ,(scene-config 'type))
           (context  . ,(scene-config 'key))))
        
        ;; 步骤3: 构建意象框架
        (build-imagery-framework
         (select-appropriate-images imagery-bank))
        
        ;; 步骤4: 凝练祝福语
        (crystallize-blessing
         '(poetic sincere personal touching))
        
        ;; 步骤5: 最终提炼
        (distill-to-essence))))
