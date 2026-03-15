class CreateAudioRecordings < ActiveRecord::Migration[8.1]
  def change
    create_table :audio_recordings do |t|
      t.references :agreement, null: false, foreign_key: true
      t.string :s3_key
      t.float :duration
      t.text :transcription
      t.string :status

      t.timestamps
    end
  end
end
