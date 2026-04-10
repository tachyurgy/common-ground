namespace :solid do
  desc "Idempotently load solid_cache and solid_queue schemas into the primary connection"
  task load_schemas: :environment do
    cn = ActiveRecord::Base.connection
    unless cn.table_exists?(:solid_cache_entries)
      puts "Loading db/cache_schema.rb..."
      load Rails.root.join("db/cache_schema.rb")
    end
    unless cn.table_exists?(:solid_queue_jobs)
      puts "Loading db/queue_schema.rb..."
      load Rails.root.join("db/queue_schema.rb")
    end
  end
end
