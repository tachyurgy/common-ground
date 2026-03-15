# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_08_101021) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "agreement_versions", force: :cascade do |t|
    t.bigint "agreement_id", null: false
    t.text "change_summary"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "version_number"
    t.index ["agreement_id"], name: "index_agreement_versions_on_agreement_id"
  end

  create_table "agreements", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.text "participant_names"
    t.string "status"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "audio_recordings", force: :cascade do |t|
    t.bigint "agreement_id", null: false
    t.datetime "created_at", null: false
    t.float "duration"
    t.string "s3_key"
    t.string "status"
    t.text "transcription"
    t.datetime "updated_at", null: false
    t.index ["agreement_id"], name: "index_audio_recordings_on_agreement_id"
  end

  create_table "follow_up_questions", force: :cascade do |t|
    t.bigint "agreement_id", null: false
    t.boolean "answered"
    t.text "context"
    t.datetime "created_at", null: false
    t.text "question"
    t.boolean "skipped"
    t.datetime "updated_at", null: false
    t.index ["agreement_id"], name: "index_follow_up_questions_on_agreement_id"
  end

  create_table "responses", force: :cascade do |t|
    t.bigint "agreement_id", null: false
    t.string "audio_s3_key"
    t.datetime "created_at", null: false
    t.string "phase"
    t.text "question"
    t.text "transcription"
    t.datetime "updated_at", null: false
    t.index ["agreement_id"], name: "index_responses_on_agreement_id"
  end

  add_foreign_key "agreement_versions", "agreements"
  add_foreign_key "audio_recordings", "agreements"
  add_foreign_key "follow_up_questions", "agreements"
  add_foreign_key "responses", "agreements"
end
