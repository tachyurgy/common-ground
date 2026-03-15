class CreateResponses < ActiveRecord::Migration[8.1]
  def change
    create_table :responses do |t|
      t.references :agreement, null: false, foreign_key: true
      t.text :question
      t.text :transcription
      t.string :audio_s3_key
      t.string :phase

      t.timestamps
    end
  end
end
