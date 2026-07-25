interface InputPanelProps {
  publicProfileUrl: string;
  arcadeGames: number;
  skillBadges: number;
  bonusMilestone: boolean;
  storageStatus: string;
  isLoading: boolean;
  error: string | null;
  onUrlChange: (url: string) => void;
  onClearUrl: () => void;
  onScrape: () => void;
  onArcadeGamesChange: (value: number) => void;
  onSkillBadgesChange: (value: number) => void;
  onBonusMilestoneChange: (checked: boolean) => void;
}

export default function InputPanel({
  publicProfileUrl,
  arcadeGames,
  skillBadges,
  bonusMilestone,
  storageStatus,
  isLoading,
  error,
  onUrlChange,
  onClearUrl,
  onScrape,
  onArcadeGamesChange,
  onSkillBadgesChange,
  onBonusMilestoneChange
}: InputPanelProps) {
  return (
    <form class="panel input-panel" novalidate>
      <h2>Input Progres</h2>
      <label>
        <span>URL publik Skills Google</span>
        <input
          type="url"
          placeholder="https://www.skills.google/public_profiles/..."
          value={publicProfileUrl}
          onInput={(e) => onUrlChange((e.target as HTMLInputElement).value)}
          autocomplete="url"
        />
      </label>
      <div class="url-actions">
        <p id="url-storage-status">{storageStatus}</p>
        <div class="button-row">
          <button type="button" onClick={onScrape} disabled={isLoading}>
            {isLoading ? 'Membaca...' : 'Baca Profil'}
          </button>
          <button type="button" onClick={onClearUrl}>
            Hapus URL
          </button>
        </div>
      </div>
      <label>
        <span>Jumlah Arcade Games selesai dari profil publik</span>
        <input
          type="number"
          min="0"
          step="1"
          value={arcadeGames}
          inputMode="numeric"
          readOnly
          onInput={(e) => onArcadeGamesChange(Number((e.target as HTMLInputElement).value) || 0)}
        />
      </label>
      <label>
        <span>Jumlah Badge Keahlian selesai dari profil publik</span>
        <input
          type="number"
          min="0"
          step="1"
          value={skillBadges}
          inputMode="numeric"
          readOnly
          onInput={(e) => onSkillBadgesChange(Number((e.target as HTMLInputElement).value) || 0)}
        />
      </label>
      <p class="field-note">Nilai Arcade Games dan Badge Keahlian diisi otomatis dari tombol Baca Profil.</p>
      <label class="checkbox-row">
        <input
          type="checkbox"
          checked={bonusMilestone}
          onInput={(e) => onBonusMilestoneChange((e.target as HTMLInputElement).checked)}
        />
        <span>Bonus Milestone selesai</span>
      </label>
      {error && <div class="validation" role="alert">{error}</div>}
    </form>
  );
}
